import { haystackOf } from "@/ai/brand/niche";
import type { GrowthCandidate } from "../types";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

const SEO_SIGNAL_TERMS = [
  "seo",
  "geo",
  "aeo",
  "cro",
  "conversion",
  "core web vitals",
  "page speed",
  "checklist",
  "guide",
  "how to",
  "optimization",
  "schema",
  "faq",
] as const;

/**
 * SEO opportunity 0–1 from opportunity factors + keyword/content-gap signals.
 */
export function scoreSeoOpportunity(candidate: GrowthCandidate): number {
  const hay = haystackOf(
    candidate.title,
    candidate.summary,
    candidate.keyword,
    ...candidate.keywords,
  );

  let termHits = 0;
  for (const term of SEO_SIGNAL_TERMS) {
    if (hay.includes(term)) termHits += 1;
  }
  const termScore = clamp01(termHits * 0.12);

  const opp =
    typeof candidate.opportunityScore === "number"
      ? clamp01(candidate.opportunityScore)
      : 0.4;
  const gap =
    typeof candidate.keywordGapScore === "number"
      ? clamp01(candidate.keywordGapScore)
      : 0.45;
  const existing =
    typeof candidate.existingContentScore === "number"
      ? clamp01(candidate.existingContentScore)
      : 0.5;

  // Higher existingContentScore in opportunity engine = more gap (less overlap).
  return clamp01(termScore * 0.35 + opp * 0.35 + gap * 0.2 + existing * 0.1);
}
