import { ResearchSourceKinds } from "../source-kinds";
import type { ResearchSourceAdapter, RawResearchHit } from "../types";
import { fetchJson, fetchText } from "../http";
import { HN_TOPIC_HINTS } from "../config";

type GhRepo = {
  name?: string;
  full_name?: string;
  html_url?: string;
  description?: string | null;
  stargazers_count?: number;
  language?: string | null;
  created_at?: string;
  pushed_at?: string;
};

/**
 * Uses GitHub Search API (public, optional GITHUB_TOKEN for higher rate limits)
 * as a stable alternative to scraping github.com/trending HTML.
 */
export const githubTrendingSource: ResearchSourceAdapter = {
  id: "github-trending",
  kind: ResearchSourceKinds.GITHUB_TRENDING,
  label: "GitHub Trending",
  category: "engineering",
  async collect(ctx) {
    try {
      const q = encodeURIComponent(
        ctx.query?.trim()
          ? `${ctx.query} stars:>50`
          : "shopify OR nextjs OR ecommerce stars:>100",
      );
      const url = `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=${ctx.limit || 12}`;
      const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
      };
      if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      }

      const text = await fetchText(url, { signal: ctx.signal, headers });
      const payload = JSON.parse(text) as { items?: GhRepo[] };
      const items = payload.items || [];

      return items.map((repo): RawResearchHit => ({
        title: repo.full_name || repo.name || "GitHub repository",
        url: repo.html_url || `https://github.com/${repo.full_name}`,
        summary: repo.description || undefined,
        publishedAt: repo.pushed_at || repo.created_at,
        keywords: [repo.language, "github", "open-source"].filter(
          Boolean,
        ) as string[],
        category: "engineering",
        sourceLabel: "GitHub",
        raw: {
          stars: repo.stargazers_count,
          language: repo.language,
        },
      }));
    } catch (error) {
      console.error("[research.github-trending]", error);
      return [];
    }
  },
};

type HnItem = {
  id: number;
  title?: string;
  url?: string;
  text?: string;
  time?: number;
  score?: number;
  type?: string;
};

export const hackerNewsSource: ResearchSourceAdapter = {
  id: "hacker-news",
  kind: ResearchSourceKinds.HACKER_NEWS,
  label: "Hacker News",
  category: "community",
  async collect(ctx) {
    try {
      const limit = ctx.limit || 12;
      const ids = (
        await fetchJson<number[]>(
          "https://hacker-news.firebaseio.com/v0/topstories.json",
          { signal: ctx.signal },
        )
      ).slice(0, 60);

      const hits: RawResearchHit[] = [];
      for (const id of ids) {
        if (hits.length >= limit) break;
        try {
          const item = await fetchJson<HnItem>(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
            { signal: ctx.signal, timeoutMs: 10_000 },
          );
          if (!item?.title) continue;
          const hay = `${item.title} ${item.text || ""}`.toLowerCase();
          const query = ctx.query?.toLowerCase();
          const relevant =
            (query && hay.includes(query)) ||
            HN_TOPIC_HINTS.some((hint) => hay.includes(hint));
          if (!relevant && !query) {
            if ((item.score || 0) < 150) continue;
          } else if (!relevant && query) {
            continue;
          }

          hits.push({
            title: item.title,
            url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
            summary: item.text?.slice(0, 400),
            publishedAt: item.time ? new Date(item.time * 1000) : undefined,
            keywords: ["hacker-news"],
            category: "community",
            sourceLabel: "Hacker News",
            raw: { id: item.id, score: item.score },
          });
        } catch {
          // skip item
        }
      }
      return hits;
    } catch (error) {
      console.error("[research.hacker-news]", error);
      return [];
    }
  },
};
