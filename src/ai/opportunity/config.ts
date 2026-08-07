import type { OpportunityFactorId } from "./types";

/** Weights must sum to 1. Tunable without code changes to scorers. */
export const OPPORTUNITY_WEIGHTS: Record<OpportunityFactorId, number> = {
  searchIntent: 0.1,
  commercialIntent: 0.16,
  competition: 0.12,
  trend: 0.1,
  freshness: 0.08,
  techlyserRelevance: 0.16,
  existingContent: 0.1,
  keywordGap: 0.1,
  authorityGap: 0.08,
};

export const COMMERCIAL_TERMS = [
  "hire",
  "agency",
  "cost",
  "price",
  "pricing",
  "best",
  "vs",
  "versus",
  "developers",
  "company",
  "services",
  "quote",
  "audit",
  "plus",
  "enterprise",
  "migration",
] as const;

export const INFORMATIONAL_TERMS = [
  "how to",
  "what is",
  "guide",
  "checklist",
  "tips",
  "tutorial",
  "examples",
  "why",
  "learn",
  "explained",
] as const;

export const TRANSACTIONAL_TERMS = [
  "buy",
  "get started",
  "sign up",
  "pricing",
  "demo",
  "book",
  "contact",
] as const;

export const TECHLYSER_FOCUS = [
  "shopify",
  "shopify plus",
  "ecommerce",
  "next.js",
  "nextjs",
  "headless",
  "vercel",
  "seo",
  "core web vitals",
  "conversion",
  "d2c",
  "india",
  "wordpress",
  "woocommerce",
  "ai",
  "automation",
  "hydrogen",
] as const;

/** Higher = harder SERP / more saturated publisher (inverse applied in competition score). */
export const SOURCE_COMPETITION_PRESSURE: Record<string, number> = {
  GOOGLE_TRENDS: 0.35,
  SHOPIFY_BLOG: 0.85,
  NEXTJS_BLOG: 0.75,
  VERCEL_BLOG: 0.75,
  OPENAI: 0.8,
  ANTHROPIC: 0.75,
  CLOUDFLARE: 0.7,
  GOOGLE_SEARCH_CENTRAL: 0.9,
  GITHUB_TRENDING: 0.45,
  PRODUCT_HUNT: 0.4,
  HACKER_NEWS: 0.5,
  REDDIT: 0.35,
  COMPETITOR_BLOG: 0.55,
  OTHER: 0.5,
};

/** Authority of the source — high authority + content gap = opportunity. */
export const SOURCE_AUTHORITY: Record<string, number> = {
  GOOGLE_TRENDS: 0.7,
  SHOPIFY_BLOG: 0.95,
  NEXTJS_BLOG: 0.9,
  VERCEL_BLOG: 0.9,
  OPENAI: 0.9,
  ANTHROPIC: 0.85,
  CLOUDFLARE: 0.85,
  GOOGLE_SEARCH_CENTRAL: 0.98,
  GITHUB_TRENDING: 0.6,
  PRODUCT_HUNT: 0.55,
  HACKER_NEWS: 0.65,
  REDDIT: 0.4,
  COMPETITOR_BLOG: 0.7,
  OTHER: 0.45,
};
