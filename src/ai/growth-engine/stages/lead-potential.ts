import { haystackOf } from "@/ai/brand/niche";
import { LEAD_POTENTIAL_TERMS } from "../config";
import type { GrowthCandidate } from "../types";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Agency lead potential 0–1 — topics that attract Shopify founders/developers
 * toward audit, hire, CRO, migration, and growth services.
 */
export function scoreLeadPotential(candidate: GrowthCandidate): number {
  const hay = haystackOf(
    candidate.title,
    candidate.summary,
    candidate.keyword,
    candidate.category,
    ...candidate.keywords,
  );

  let hits = 0;
  for (const term of LEAD_POTENTIAL_TERMS) {
    if (hay.includes(term)) hits += 1;
  }

  const termScore = clamp01(0.15 + hits * 0.09);
  const commercial =
    typeof candidate.commercialIntentScore === "number"
      ? clamp01(candidate.commercialIntentScore)
      : 0.35;

  return clamp01(termScore * 0.65 + commercial * 0.35);
}
