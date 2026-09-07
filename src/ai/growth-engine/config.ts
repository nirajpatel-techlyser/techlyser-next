/** Tunable Growth Engine thresholds — Techlyser brand growth first. */

export const GROWTH_SCORE_WEIGHTS = {
  relevance: 0.3,
  seoOpportunity: 0.25,
  leadPotential: 0.25,
  priorityNorm: 0.2,
} as const;

export const GROWTH_THRESHOLDS = {
  /** Hard reject below this Techlyser relevance (0–1 diagnostic). */
  minRelevance: 0.35,
  /** Primary gate: techlyserGrowthScore must be >= 70. */
  minTechlyserGrowthScore: 70,
  /** Legacy 0–1 composite (kept for older callers). */
  minGrowthScore: 0.7,
  poolLimitIdeas: 40,
  poolLimitOpportunities: 40,
  /** Soft-dedupe: skip topics overlapping recent blogs this strongly. */
  maxTitleOverlapWithRecent: 0.55,
  recentBlogLookback: 30,
} as const;

export const GROWTH_QUALITY_THRESHOLDS = {
  minSeoScore: 70,
  minGeoScore: 60,
  minReadingMinutes: 5,
  minContentChars: 1200,
  minTechlyserGrowthScore: 70,
} as const;

/** Allowed internal CTA paths — must exist in the Next.js app. */
export const GROWTH_ALLOWED_CTA_HREFS = [
  "/services",
  "/services/shopify",
  "/services/nextjs",
  "/services/wordpress",
  "/services/ui-ux",
  "/services/performance",
  "/services/seo",
  "/shopify-developers-india",
  "/free-shopify-audit",
  "/contact",
  "/resources",
  "/blog",
  "/about",
  "/portfolio",
] as const;

export const LEAD_POTENTIAL_TERMS = [
  "audit",
  "hire",
  "agency",
  "cro",
  "conversion",
  "performance",
  "seo",
  "redesign",
  "rebuild",
  "migrate",
  "custom",
  "ai",
  "shopify",
  "next.js",
  "wordpress",
  "founder",
  "growth",
  "scalability",
] as const;
