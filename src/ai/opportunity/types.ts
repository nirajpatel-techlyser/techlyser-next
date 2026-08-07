import type { ResearchItem, ResearchSourceKind } from "@prisma/client";

export type OpportunityFactorId =
  | "searchIntent"
  | "commercialIntent"
  | "competition"
  | "trend"
  | "freshness"
  | "techlyserRelevance"
  | "existingContent"
  | "keywordGap"
  | "authorityGap";

export type FactorScore = {
  id: OpportunityFactorId;
  score: number;
  weight: number;
  note: string;
};

export type ScoredOpportunity = {
  title: string;
  summary: string;
  url: string | null;
  category: string | null;
  keywords: string[];
  intentLabel: string;
  opportunityScore: number;
  searchIntentScore: number;
  commercialIntentScore: number;
  competitionScore: number;
  trendScore: number;
  freshnessScore: number;
  techlyserRelevanceScore: number;
  existingContentScore: number;
  keywordGapScore: number;
  authorityGapScore: number;
  rationale: string;
  factors: FactorScore[];
  researchItemId: string;
  keywordId?: string | null;
};

export type OpportunityCorpus = {
  blogTitles: string[];
  blogKeywords: string[];
  blogSlugs: string[];
  trackedKeywords: string[];
};

export type OpportunityEngineOptions = {
  /** Limit research items to analyze. Default 100. */
  limit?: number;
  /** Only items with relevanceScore >= this. Default 0. */
  minResearchRelevance?: number;
  /** Research item statuses to include. Default NEW + PROCESSED. */
  researchStatuses?: Array<"NEW" | "PROCESSED" | "ARCHIVED" | "IGNORED">;
  dryRun?: boolean;
  /** Recompute ranks for all NEW/REVIEWED after upsert. Default true. */
  rerank?: boolean;
};

export type OpportunityEngineReport = {
  analyzed: number;
  upserted: number;
  skipped: number;
  top: Array<{
    title: string;
    score: number;
    rank: number | null;
    url: string | null;
  }>;
};

export type ResearchItemLike = Pick<
  ResearchItem,
  | "id"
  | "title"
  | "url"
  | "category"
  | "keywords"
  | "source"
  | "sourceLabel"
  | "publishedAt"
  | "summary"
  | "relevanceScore"
  | "status"
> & {
  source: ResearchSourceKind;
};
