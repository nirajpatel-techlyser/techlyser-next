/**
 * AI Research Engine (Phase 2)
 *
 * Collects market signals from configured sources, normalizes them into
 * ResearchItem rows, and attaches them to a Research run.
 *
 * No UI — call `runMarketResearch()` from scripts, cron, or future admin actions.
 */

export type {
  MarketResearchOptions,
  MarketResearchReport,
  NormalizedResearchResult,
  RawResearchHit,
  ResearchSourceAdapter,
  ResearchSourceId,
} from "./types";

export { DEFAULT_FOCUS_KEYWORDS, RESEARCH_USER_AGENT } from "./config";
export { normalizeHit, normalizeHits, scoreRelevance } from "./normalize";
export {
  completeResearchRun,
  createResearchRun,
  listRecentResearchItems,
  persistResearchItems,
} from "./store";
export { getResearchSources, listResearchSourceIds, RESEARCH_SOURCE_REGISTRY } from "./sources";
export { createResearchEngine, runMarketResearch } from "./engine";

import { runMarketResearch } from "./engine";
import type { ResearchBriefInput, ResearchBriefOutput } from "./legacy-types";

export type { ResearchBriefInput, ResearchBriefOutput } from "./legacy-types";

/** Back-compat factory from Phase 1 contracts. */
export function createResearchService() {
  return {
    async run(input: ResearchBriefInput = {}): Promise<ResearchBriefOutput> {
      const report = await runMarketResearch({
        query: undefined,
        locale: input.locale || "en-IN",
        createRun: true,
        runTitle: input.keywordId
          ? `Research for keyword ${input.keywordId}`
          : input.topicId
            ? `Research for topic ${input.topicId}`
            : "Market research brief",
      });

      return {
        researchId: report.researchId || "unknown",
        summary: `Collected ${report.collected} items; upserted ${report.upserted}.`,
        entities: Object.keys(report.bySource),
        sourceUrls: report.items.slice(0, 20).map((item) => item.url),
        gaps: Object.entries(report.bySource)
          .filter(([, stats]) => stats.error || stats.collected === 0)
          .map(([id, stats]) =>
            stats.error ? `${id}: ${stats.error}` : `${id}: no items`,
          ),
      };
    },
  };
}
