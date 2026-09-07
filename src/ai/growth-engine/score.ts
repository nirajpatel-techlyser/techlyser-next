import { GROWTH_THRESHOLDS } from "./config";
import { computeTechlyserGrowthScore } from "./stages/growth-score";
import { scoreLeadPotential } from "./stages/lead-potential";
import { scoreTechlyserRelevance } from "./stages/relevance";
import { scoreSeoOpportunity } from "./stages/seo-opportunity";
import { filterThirdParty } from "./stages/third-party";
import type { GrowthCandidate, GrowthDecision, GrowthStageScores } from "./types";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function normalizePriority(priority: number): number {
  return clamp01(priority / 100);
}

/**
 * Score one candidate:
 * Third-Party Filter → techlyserGrowthScore (0–100) + stage diagnostics.
 * Accept only when third-party passes AND techlyserGrowthScore >= 70.
 */
export function scoreGrowthCandidate(candidate: GrowthCandidate): GrowthDecision {
  const thirdParty = filterThirdParty(candidate);
  const breakdown = computeTechlyserGrowthScore(candidate);
  const relevance = scoreTechlyserRelevance(candidate);
  const seoOpportunity = scoreSeoOpportunity(candidate);
  const leadPotential = scoreLeadPotential(candidate);
  const priorityNorm = normalizePriority(candidate.priority);

  const scores: GrowthStageScores = {
    relevance,
    thirdPartyPass: thirdParty.pass,
    thirdPartyNote: thirdParty.note,
    seoOpportunity,
    leadPotential,
    priorityNorm,
    techlyserGrowthScore: breakdown.total,
    growthBreakdown: breakdown,
  };

  /** Normalized 0–1 for backward-compatible report fields. */
  const growthScore = clamp01(breakdown.total / 100);

  let accepted = true;
  let rejectReason: string | undefined;

  if (!thirdParty.pass) {
    accepted = false;
    rejectReason = thirdParty.note;
  } else if (breakdown.total < GROWTH_THRESHOLDS.minTechlyserGrowthScore) {
    accepted = false;
    rejectReason = `techlyserGrowthScore ${breakdown.total} below min ${GROWTH_THRESHOLDS.minTechlyserGrowthScore}${
      breakdown.penaltyNotes.length
        ? ` (${breakdown.penaltyNotes.join("; ")})`
        : ""
    }`;
  }

  return {
    candidateId: candidate.id,
    source: candidate.source,
    title: candidate.title,
    keyword: candidate.keyword,
    scores,
    growthScore,
    techlyserGrowthScore: breakdown.total,
    accepted,
    rejectReason,
    rankedAt: new Date().toISOString(),
  };
}

/** @deprecated use techlyserGrowthScore / 100 */
export function computeGrowthScore(scores: GrowthStageScores): number {
  if (typeof scores.techlyserGrowthScore === "number") {
    return clamp01(scores.techlyserGrowthScore / 100);
  }
  return 0;
}
