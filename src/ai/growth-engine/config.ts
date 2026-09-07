/** Tunable Growth Engine weights and thresholds. */

export const GROWTH_SCORE_WEIGHTS = {
  relevance: 0.3,
  seoOpportunity: 0.25,
  leadPotential: 0.25,
  priorityNorm: 0.2,
} as const;

export const GROWTH_THRESHOLDS = {
  /** Hard reject below this Techlyser relevance. */
  minRelevance: 0.35,
  /** Hard reject below this composite growth score. */
  minGrowthScore: 0.45,
  /** Max candidates loaded into the topic pool. */
  poolLimitIdeas: 40,
  poolLimitOpportunities: 40,
} as const;

export const GROWTH_QUALITY_THRESHOLDS = {
  minSeoScore: 70,
  minGeoScore: 60,
  minReadingMinutes: 4,
  minContentChars: 800,
} as const;

/** Allowed internal CTA paths for quality gate. */
export const GROWTH_ALLOWED_CTA_HREFS = [
  "/free-shopify-audit",
  "/services/shopify",
  "/shopify-developers-india",
  "/contact",
  "/resources",
  "/services/nextjs",
] as const;

export const LEAD_POTENTIAL_TERMS = [
  "audit",
  "hire",
  "agency",
  "cro",
  "conversion",
  "a/b test",
  "ab test",
  "geo",
  "aeo",
  "migration",
  "shopify plus",
  "developers",
  "cost",
  "pricing",
  "checklist",
  "roadmap",
  "founder",
  "growth",
] as const;
