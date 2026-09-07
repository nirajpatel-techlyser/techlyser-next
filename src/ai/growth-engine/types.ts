/**
 * Techlyser Growth Engine — content decision DTOs.
 * Scores live in memory / AiAgentRun.output (no new Prisma tables).
 */

export type GrowthCandidateSource = "contentIdea" | "opportunity";

export type GrowthCandidate = {
  source: GrowthCandidateSource;
  id: string;
  contentIdeaId?: string;
  title: string;
  summary: string;
  keyword: string;
  keywords: string[];
  category: string;
  intentLabel: string | null;
  /** 0–100 style priority from ContentIdea, or opportunityScore*100 */
  priority: number;
  targetWords?: number | null;
  /** Existing opportunity factor hints when available */
  opportunityScore?: number | null;
  techlyserRelevanceScore?: number | null;
  commercialIntentScore?: number | null;
  keywordGapScore?: number | null;
  existingContentScore?: number | null;
};

export type GrowthStageScores = {
  relevance: number;
  thirdPartyPass: boolean;
  thirdPartyNote: string;
  seoOpportunity: number;
  leadPotential: number;
  priorityNorm: number;
};

export type GrowthDecision = {
  candidateId: string;
  source: GrowthCandidateSource;
  title: string;
  keyword: string;
  scores: GrowthStageScores;
  growthScore: number;
  accepted: boolean;
  rejectReason?: string;
  rankedAt: string;
};

export type GrowthSelectResult = {
  decision: GrowthDecision;
  /** Ranked accepted candidates (best first), for debugging / dry-run */
  ranked: GrowthDecision[];
  rejected: GrowthDecision[];
};

export type GrowthQualityInput = {
  title: string;
  slug: string;
  seoScore?: number | null;
  geoScore?: number | null;
  readingTimeMinutes?: number | null;
  contentLength?: number | null;
  ctaHref?: string | null;
};

export type GrowthQualityResult = {
  ok: boolean;
  score: number;
  checks: Array<{ id: string; ok: boolean; detail: string }>;
};
