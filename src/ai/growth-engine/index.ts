/**
 * Techlyser Growth Engine
 *
 * Content decision pipeline (modular, sits on existing research/opportunity/writer):
 * Research → Topic Pool → Techlyser Relevance → Third-Party Filter
 *   → SEO Opportunity → Lead Potential → Topic Selection
 *   → Content Generation → Quality Check → Publish
 */

export * from "./types";
export * from "./config";
export { buildTopicPool } from "./pool";
export { scoreGrowthCandidate, computeGrowthScore, normalizePriority } from "./score";
export { selectGrowthTopic, rankGrowthTopics } from "./select";
export { runGrowthQualityCheck } from "./stages/quality";
