/**
 * Techlyser Growth Engine — content decision DTOs.
 */

import type { TechlyserGrowthScoreBreakdown } from "./stages/growth-score";

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
  priority: number;
  targetWords?: number | null;
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
  /** Primary 0–100 brand-growth score */
  techlyserGrowthScore?: number;
  growthBreakdown?: TechlyserGrowthScoreBreakdown;
};

export type GrowthDecision = {
  candidateId: string;
  source: GrowthCandidateSource;
  title: string;
  keyword: string;
  scores: GrowthStageScores;
  /** Normalized 0–1 (techlyserGrowthScore / 100) */
  growthScore: number;
  /** Primary score 0–100 */
  techlyserGrowthScore: number;
  accepted: boolean;
  rejectReason?: string;
  rankedAt: string;
};

export type GrowthSelectResult = {
  decision: GrowthDecision;
  ranked: GrowthDecision[];
  rejected: GrowthDecision[];
};

export type GrowthQualityInput = {
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: string | null;
  tags?: string[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoScore?: number | null;
  geoScore?: number | null;
  readingTimeMinutes?: number | null;
  contentLength?: number | null;
  ctaHref?: string | null;
  techlyserGrowthScore?: number | null;
  articleMarkdownOrHtml?: string | null;
};

export type GrowthQualityResult = {
  ok: boolean;
  score: number;
  checks: Array<{ id: string; ok: boolean; detail: string }>;
};
