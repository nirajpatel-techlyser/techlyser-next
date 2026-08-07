import { ResearchSourceKinds } from "../source-kinds";
import { prisma } from "@/lib/prisma";
import type { ResearchSourceAdapter, RawResearchHit } from "../types";
import { COMPETITOR_FEED_CANDIDATES } from "../config";
import { collectFromRss } from "./rss";

function originFromUrl(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

async function discoverCompetitorFeed(domainOrUrl: string): Promise<string | null> {
  const origin =
    originFromUrl(
      domainOrUrl.startsWith("http") ? domainOrUrl : `https://${domainOrUrl}`,
    ) || null;
  if (!origin) return null;

  for (const path of COMPETITOR_FEED_CANDIDATES) {
    const feedUrl = `${origin}${path}`;
    try {
      const hits = await collectFromRss({
        feedUrl,
        limit: 1,
      });
      if (hits.length > 0) return feedUrl;
    } catch {
      // try next
    }
  }
  return null;
}

export const competitorBlogsSource: ResearchSourceAdapter = {
  id: "competitor-blogs",
  kind: ResearchSourceKinds.COMPETITOR_BLOG,
  label: "Competitor blogs",
  category: "competitors",
  async collect(ctx) {
    try {
      const competitors = await prisma.competitor.findMany({
        take: 20,
        orderBy: { updatedAt: "desc" },
      });

      if (competitors.length === 0) {
        console.warn(
          "[research.competitor-blogs] No Competitor rows found — skipping",
        );
        return [];
      }

      const limit = ctx.limit || 12;
      const hits: RawResearchHit[] = [];

      for (const competitor of competitors) {
        if (hits.length >= limit) break;
        const base = competitor.pageUrl || `https://${competitor.domain}`;
        let feedUrl: string | null = null;

        // If pageUrl already looks like a feed, use it
        if (/\.(xml|rss|atom)(\?|$)/i.test(base) || /\/feed\/?$/i.test(base)) {
          feedUrl = base;
        } else {
          feedUrl = await discoverCompetitorFeed(base);
        }

        if (!feedUrl) continue;

        try {
          const items = await collectFromRss({
            feedUrl,
            limit: Math.max(3, Math.ceil(limit / competitors.length)),
            signal: ctx.signal,
            sourceLabel: competitor.name,
          });
          for (const item of items) {
            if (hits.length >= limit) break;
            if (
              ctx.query &&
              !`${item.title} ${item.summary || ""}`
                .toLowerCase()
                .includes(ctx.query.toLowerCase())
            ) {
              continue;
            }
            hits.push({
              ...item,
              category: "competitors",
              keywords: [competitor.domain, competitor.name.toLowerCase()],
              sourceLabel: competitor.name,
              raw: {
                competitorId: competitor.id,
                domain: competitor.domain,
                feedUrl,
              },
            });
          }
        } catch (error) {
          console.error(
            `[research.competitor-blogs:${competitor.domain}]`,
            error,
          );
        }
      }

      return hits;
    } catch (error) {
      console.error("[research.competitor-blogs]", error);
      return [];
    }
  },
};
