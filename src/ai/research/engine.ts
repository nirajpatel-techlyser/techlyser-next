import { DEFAULT_FOCUS_KEYWORDS, DEFAULT_LIMIT_PER_SOURCE } from "./config";
import { normalizeHits } from "./normalize";
import {
  completeResearchRun,
  createResearchRun,
  persistResearchItems,
} from "./store";
import { getResearchSources } from "./sources";
import type {
  MarketResearchOptions,
  MarketResearchReport,
  NormalizedResearchResult,
} from "./types";

/**
 * AI Research Engine — market signal collector.
 * Collect → normalize → score → persist (ResearchItem).
 */
export async function runMarketResearch(
  options: MarketResearchOptions = {},
): Promise<MarketResearchReport> {
  const sources = getResearchSources(options.sources);
  const limitPerSource = options.limitPerSource ?? DEFAULT_LIMIT_PER_SOURCE;
  const focusKeywords = options.focusKeywords?.length
    ? options.focusKeywords
    : [...DEFAULT_FOCUS_KEYWORDS];
  const createRun = options.createRun !== false;

  let researchId: string | null = null;
  if (createRun && !options.dryRun) {
    const run = await createResearchRun({
      title:
        options.runTitle ||
        `Market research ${new Date().toISOString().slice(0, 10)}`,
      query: options.query,
      sources: sources.map((s) => s.id),
    });
    researchId = run.id;
  }

  const bySource: MarketResearchReport["bySource"] = {};
  const allItems: NormalizedResearchResult[] = [];
  let upsertedTotal = 0;
  let skippedTotal = 0;

  for (const source of sources) {
    bySource[source.id] = { collected: 0, upserted: 0 };
    try {
      const rawHits = await source.collect({
        query: options.query,
        locale: options.locale || "en-IN",
        limit: limitPerSource,
      });

      const normalized = normalizeHits({
        hits: rawHits,
        source: source.kind,
        sourceLabel: source.label,
        defaultCategory: source.category,
        focusKeywords,
      });

      bySource[source.id].collected = normalized.length;
      allItems.push(...normalized);

      const persisted = await persistResearchItems({
        items: normalized,
        researchId,
        dryRun: options.dryRun,
      });

      bySource[source.id].upserted = persisted.upserted;
      upsertedTotal += persisted.upserted;
      skippedTotal += persisted.skipped;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[research.engine:${source.id}]`, error);
      bySource[source.id].error = message;
    }
  }

  // Deduplicate across sources by URL (keep highest relevance)
  const bestByUrl = new Map<string, NormalizedResearchResult>();
  for (const item of allItems) {
    const existing = bestByUrl.get(item.url);
    if (!existing || item.relevanceScore > existing.relevanceScore) {
      bestByUrl.set(item.url, item);
    }
  }
  const deduped = [...bestByUrl.values()].sort(
    (a, b) => b.relevanceScore - a.relevanceScore,
  );

  if (researchId) {
    await completeResearchRun(researchId, {
      status: "COMPLETED",
      summary: `Collected ${deduped.length} unique items across ${sources.length} sources (${upsertedTotal} upserted).`,
      sourceUrls: deduped.slice(0, 50).map((item) => item.url),
    });
  }

  return {
    researchId,
    collected: deduped.length,
    upserted: upsertedTotal,
    skipped: skippedTotal,
    bySource,
    items: deduped,
  };
}

export function createResearchEngine() {
  return {
    runMarketResearch,
    listSources: () => getResearchSources().map((s) => ({ id: s.id, label: s.label })),
  };
}
