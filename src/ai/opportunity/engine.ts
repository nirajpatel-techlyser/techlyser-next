import { loadOpportunityCorpus, loadResearchItemsForOpportunity } from "./context";
import { scoreResearchItem } from "./score";
import {
  listTopOpportunities,
  rerankOpportunities,
  upsertOpportunities,
} from "./store";
import type { OpportunityEngineOptions, OpportunityEngineReport } from "./types";

/**
 * Opportunity Engine — analyze research → score factors → rank → persist.
 */
export async function runOpportunityEngine(
  options: OpportunityEngineOptions = {},
): Promise<OpportunityEngineReport> {
  const limit = options.limit ?? 100;
  const minResearchRelevance = options.minResearchRelevance ?? 0;
  const researchStatuses = options.researchStatuses ?? ["NEW", "PROCESSED"];
  const rerank = options.rerank !== false;

  const [corpus, items] = await Promise.all([
    loadOpportunityCorpus(),
    loadResearchItemsForOpportunity({
      limit,
      minResearchRelevance,
      researchStatuses,
    }),
  ]);

  const scored = items.map((item) => scoreResearchItem(item, corpus));
  scored.sort((a, b) => b.opportunityScore - a.opportunityScore);

  const persisted = await upsertOpportunities(scored, options.dryRun);

  if (rerank && !options.dryRun) {
    await rerankOpportunities();
  }

  const topRows = options.dryRun
    ? scored.slice(0, 10).map((item, index) => ({
        title: item.title,
        score: item.opportunityScore,
        rank: index + 1,
        url: item.url,
      }))
    : (await listTopOpportunities(10)).map((row) => ({
        title: row.title,
        score: row.opportunityScore,
        rank: row.rank,
        url: row.url,
      }));

  return {
    analyzed: items.length,
    upserted: persisted.upserted,
    skipped: persisted.skipped,
    top: topRows,
  };
}

export function createOpportunityEngine() {
  return {
    run: runOpportunityEngine,
    listTop: listTopOpportunities,
    rerank: rerankOpportunities,
  };
}
