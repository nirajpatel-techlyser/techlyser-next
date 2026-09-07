/**
 * Techlyser Growth Engine
 *
 * Research → Topic Pool → techlyserGrowthScore → Third-Party Filter
 *   → Topic Selection (≥70) → Content Generation → validateContent → Publish
 */

export * from "./types";
export * from "./config";
export { buildTopicPool } from "./pool";
export { scoreGrowthCandidate, computeGrowthScore, normalizePriority } from "./score";
export { selectGrowthTopic, rankGrowthTopics } from "./select";
export {
  runGrowthQualityCheck,
  validateContent,
} from "./stages/quality";
export { computeTechlyserGrowthScore } from "./stages/growth-score";
