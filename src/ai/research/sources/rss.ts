import type { ResearchSourceAdapter } from "../types";
import { fetchText, parseFeedXml } from "../http";
import type { RawResearchHit } from "../types";

export async function collectFromRss(input: {
  feedUrl: string;
  limit: number;
  signal?: AbortSignal;
  sourceLabel?: string;
}): Promise<RawResearchHit[]> {
  const xml = await fetchText(input.feedUrl, { signal: input.signal });
  return parseFeedXml(xml, input.limit).map((item) => ({
    title: item.title,
    url: item.url,
    summary: item.summary,
    publishedAt: item.publishedAt,
    sourceLabel: input.sourceLabel,
    raw: { feedUrl: input.feedUrl },
  }));
}

export function rssAdapter(
  partial: Omit<ResearchSourceAdapter, "collect"> & {
    feedUrl: string | ((ctx: { locale?: string }) => string);
  },
): ResearchSourceAdapter {
  return {
    id: partial.id,
    kind: partial.kind,
    label: partial.label,
    category: partial.category,
    async collect(ctx) {
      try {
        const feedUrl =
          typeof partial.feedUrl === "function"
            ? partial.feedUrl({ locale: ctx.locale })
            : partial.feedUrl;
        return await collectFromRss({
          feedUrl,
          limit: ctx.limit || 12,
          signal: ctx.signal,
          sourceLabel: partial.label,
        });
      } catch (error) {
        console.error(`[research.${partial.id}]`, error);
        return [];
      }
    },
  };
}
