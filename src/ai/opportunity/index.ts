/**
 * Opportunity Engine (Phase 3)
 *
 * Analyzes ResearchItems, computes multi-factor Opportunity Scores,
 * ranks results, and persists Opportunity rows.
 */

export type {
  FactorScore,
  OpportunityCorpus,
  OpportunityEngineOptions,
  OpportunityEngineReport,
  OpportunityFactorId,
  ResearchItemLike,
  ScoredOpportunity,
} from "./types";

export { OPPORTUNITY_WEIGHTS, TECHLYSER_FOCUS } from "./config";
export { detectIntentLabel, scoreResearchItem } from "./score";
export { loadOpportunityCorpus, loadResearchItemsForOpportunity } from "./context";
export {
  listTopOpportunities,
  rerankOpportunities,
  upsertOpportunities,
} from "./store";
export { createOpportunityEngine, runOpportunityEngine } from "./engine";
