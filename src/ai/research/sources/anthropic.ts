import { ResearchSourceKinds } from "../source-kinds";
import type { ResearchSourceAdapter, RawResearchHit } from "../types";
import { fetchText } from "../http";

/**
 * Anthropic does not always expose a stable public RSS.
 * We collect from their news/product pages via known public JSON when available,
 * and fall back to curated newsroom URLs.
 */
const ANTHROPIC_FALLBACK: RawResearchHit[] = [
  {
    title: "Anthropic newsroom",
    url: "https://www.anthropic.com/news",
    summary: "Official Anthropic product and research announcements.",
    keywords: ["anthropic", "claude", "ai"],
    category: "ai",
  },
  {
    title: "Claude documentation",
    url: "https://docs.anthropic.com/",
    summary: "Anthropic developer documentation and model capability updates.",
    keywords: ["claude", "api", "llm"],
    category: "ai",
  },
];

export const anthropicSource: ResearchSourceAdapter = {
  id: "anthropic",
  kind: ResearchSourceKinds.ANTHROPIC,
  label: "Anthropic",
  category: "ai",
  async collect(ctx) {
    try {
      // Attempt Atom/RSS discovery on news page links is brittle; prefer known endpoints.
      const candidates = [
        "https://www.anthropic.com/news/rss.xml",
        "https://www.anthropic.com/feed.xml",
      ];

      for (const feedUrl of candidates) {
        try {
          const xml = await fetchText(feedUrl, {
            signal: ctx.signal,
            timeoutMs: 12_000,
          });
          if (xml.includes("<item") || xml.includes("<entry")) {
            const { parseFeedXml } = await import("../http");
            return parseFeedXml(xml, ctx.limit || 12).map((item) => ({
              title: item.title,
              url: item.url,
              summary: item.summary,
              publishedAt: item.publishedAt,
              category: "ai",
              keywords: ["anthropic", "claude"],
              sourceLabel: "Anthropic",
              raw: { feedUrl },
            }));
          }
        } catch {
          // try next candidate
        }
      }

      return ANTHROPIC_FALLBACK.slice(0, ctx.limit || 12);
    } catch (error) {
      console.error("[research.anthropic]", error);
      return ANTHROPIC_FALLBACK.slice(0, ctx.limit || 12);
    }
  },
};
