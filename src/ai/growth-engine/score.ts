import { GROWTH_SCORE_WEIGHTS, GROWTH_THRESHOLDS } from "./config";
import { scoreLeadPotential } from "./stages/lead-potential";
import { scoreTechlyserRelevance } from "./stages/relevance";
import { scoreSeoOpportunity } from "./stages/seo-opportunity";
import { filterThirdParty } from "./stages/third-party";
import type { GrowthCandidate, GrowthDecision, GrowthStageScores } from "./types";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function normalizePriority(priority: number): number {
  // ContentIdea priorities are often 0–100; opportunityScore*100 similarly.
  return clamp01(priority / 100);
}

export function computeGrowthScore(scores: GrowthStageScores): number {
  const w = GROWTH_SCORE_WEIGHTS;
  return clamp01(
    scores.relevance * w.relevance +
      scores.seoOpportunity * w.seoOpportunity +
      scores.leadPotential * w.leadPotential +
      scores.priorityNorm * w.priorityNorm,
  );
}

/**
 * Score one candidate through:
 * Techlyser Relevance → Third-Party Filter → SEO Opportunity → Lead Potential
 */
export function scoreGrowthCandidate(candidate: GrowthCandidate): GrowthDecision {
  const thirdParty = filterThirdParty(candidate);
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
  };

  const growthScore = computeGrowthScore(scores);
  let accepted = true;
  let rejectReason: string | undefined;

  if (!thirdParty.pass) {
    accepted = false;
    rejectReason = thirdParty.note;
  } else if (relevance < GROWTH_THRESHOLDS.minRelevance) {
    accepted = false;
    rejectReason = `Relevance ${relevance.toFixed(2)} below min ${GROWTH_THRESHOLDS.minRelevance}`;
  } else if (growthScore < GROWTH_THRESHOLDS.minGrowthScore) {
    accepted = false;
    rejectReason = `Growth score ${growthScore.toFixed(2)} below min ${GROWTH_THRESHOLDS.minGrowthScore}`;
  }

  return {
    candidateId: candidate.id,
    source: candidate.source,
    title: candidate.title,
    keyword: candidate.keyword,
    scores,
    growthScore,
    accepted,
    rejectReason,
    rankedAt: new Date().toISOString(),
  };
}
