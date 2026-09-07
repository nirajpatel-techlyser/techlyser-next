import {
  GROWTH_PRACTICE_TERMS,
  hasCommerceAnchor,
  haystackOf,
  isOffBrandProductTopic,
} from "@/ai/brand/niche";
import type { GrowthCandidate } from "../types";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Techlyser relevance 0–1 from commerce anchors + growth practice terms
 * and any persisted opportunity techlyserRelevanceScore.
 */
export function scoreTechlyserRelevance(candidate: GrowthCandidate): number {
  if (isOffBrandProductTopic(candidate.title, candidate.summary, candidate.keyword)) {
    return 0;
  }

  const hay = haystackOf(
    candidate.title,
    candidate.summary,
    candidate.keyword,
    candidate.category,
    ...candidate.keywords,
  );

  if (!hasCommerceAnchor(hay)) {
    return 0.1;
  }

  let hits = 0;
  for (const term of GROWTH_PRACTICE_TERMS) {
    if (hay.includes(term)) hits += 1;
  }

  const practiceBoost = clamp01(hits * 0.08);
  const persisted =
    typeof candidate.techlyserRelevanceScore === "number"
      ? clamp01(candidate.techlyserRelevanceScore)
      : 0.45;

  return clamp01(0.45 + practiceBoost * 0.4 + persisted * 0.25);
}
