import {
  detectContentPillars,
  SERVICE_RELEVANCE_TERMS,
} from "@/ai/brand/positioning";
import { haystackOf, isOffBrandProductTopic } from "@/ai/brand/niche";
import type { GrowthCandidate } from "../types";

export type TechlyserGrowthScoreBreakdown = {
  serviceRelevance: number;
  customerRelevance: number;
  seoOpportunity: number;
  linkedinPotential: number;
  technicalExpertise: number;
  leadPotential: number;
  timely: number;
  evergreen: number;
  penalties: number;
  penaltyNotes: string[];
  total: number;
};

const CUSTOMER_PROBLEM_TERMS = [
  "slow",
  "convert",
  "conversion",
  "mobile",
  "outdated",
  "cms",
  "seo",
  "checkout",
  "integration",
  "scale",
  "scalability",
  "performance",
  "redesign",
  "rebuild",
  "roi",
  "founder",
  "business",
  "merchant",
  "d2c",
  "ecommerce",
  "website",
] as const;

const SEO_TERMS = [
  "seo",
  "geo",
  "aeo",
  "llmo",
  "core web vitals",
  "schema",
  "search",
  "organic",
  "keyword",
  "intent",
  "crawl",
  "index",
  "conversion",
  "cro",
  "checkout",
  "cart",
  "page speed",
  "performance",
] as const;

const LINKEDIN_DISCUSSION_TERMS = [
  "why",
  "when should",
  "mistake",
  "myth",
  "problem",
  "instead of",
  "what businesses",
  "decision",
  "trade-off",
  "tradeoff",
  "opinion",
  "change",
] as const;

const TECHNICAL_TERMS = [
  "architecture",
  "api",
  "next.js",
  "react",
  "performance",
  "liquid",
  "hydrogen",
  "schema",
  "integration",
  "migration",
  "headless",
  "core web vitals",
  "security",
] as const;

const LEAD_TERMS = [
  "audit",
  "hire",
  "agency",
  "rebuild",
  "migrate",
  "custom",
  "cro",
  "performance",
  "seo",
  "shopify",
  "next.js",
  "wordpress",
  "ai integration",
] as const;

const TRENDING_TERMS = [
  "2025",
  "2026",
  "latest",
  "new",
  "update",
  "change",
  "google",
  "ai search",
] as const;

const EVERGREEN_TERMS = [
  "how to",
  "checklist",
  "guide",
  "framework",
  "playbook",
  "when should",
  "why your",
  "roadmap",
] as const;

const NEWS_REWRITE_TERMS = [
  "launched",
  "announces",
  "announced",
  "releases",
  "released",
  "just dropped",
] as const;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function countHits(hay: string, terms: readonly string[]) {
  let n = 0;
  for (const t of terms) {
    if (hay.includes(t)) n += 1;
  }
  return n;
}

/**
 * techlyserGrowthScore 0–100 per content brief.
 * Only topics with total >= 70 should be selected for generation.
 */
export function computeTechlyserGrowthScore(
  candidate: GrowthCandidate,
): TechlyserGrowthScoreBreakdown {
  const hay = haystackOf(
    candidate.title,
    candidate.summary,
    candidate.keyword,
    candidate.category,
    ...candidate.keywords,
  );
  const pillars = detectContentPillars(
    candidate.title,
    candidate.summary,
    candidate.keyword,
  );

  let serviceRelevance = 0;
  if (pillars.length > 0 || countHits(hay, SERVICE_RELEVANCE_TERMS) >= 1) {
    serviceRelevance = pillars.length >= 2 ? 20 : 16;
    if (countHits(hay, SERVICE_RELEVANCE_TERMS) >= 3) serviceRelevance = 20;
  }

  let customerRelevance = 0;
  const customerHits = countHits(hay, CUSTOMER_PROBLEM_TERMS);
  if (customerHits >= 3) customerRelevance = 20;
  else if (customerHits >= 1) customerRelevance = 12;

  let seoOpportunity = 0;
  const seoHits = countHits(hay, SEO_TERMS);
  if (seoHits >= 2) seoOpportunity = 15;
  else if (seoHits >= 1) seoOpportunity = 10;
  else if (typeof candidate.keywordGapScore === "number") {
    seoOpportunity = Math.round(candidate.keywordGapScore * 15);
  }

  let linkedinPotential = 0;
  const liHits = countHits(hay, LINKEDIN_DISCUSSION_TERMS);
  if (liHits >= 2) linkedinPotential = 15;
  else if (liHits >= 1) linkedinPotential = 10;
  else if (
    /\b(should|fix|problem|vs|instead|when|why|how)\b/i.test(candidate.title)
  ) {
    linkedinPotential = 10;
  } else {
    linkedinPotential = 5;
  }

  let technicalExpertise = 0;
  const techHits = countHits(hay, TECHNICAL_TERMS);
  if (techHits >= 2) technicalExpertise = 10;
  else if (techHits >= 1) technicalExpertise = 6;
  else if (pillars.includes("web-development") || pillars.includes("ecommerce")) {
    technicalExpertise = 6;
  }

  let leadPotential = 0;
  const leadHits = countHits(hay, LEAD_TERMS);
  if (leadHits >= 2) leadPotential = 10;
  else if (leadHits >= 1) leadPotential = 6;
  if (
    (hay.includes("shopify") || hay.includes("website") || hay.includes("ecommerce")) &&
    (hay.includes("cro") ||
      hay.includes("agency") ||
      hay.includes("migration") ||
      hay.includes("performance") ||
      hay.includes("redesign") ||
      hay.includes("founder"))
  ) {
    leadPotential = Math.max(leadPotential, 10);
  }
  if (typeof candidate.commercialIntentScore === "number") {
    leadPotential = Math.max(
      leadPotential,
      Math.round(candidate.commercialIntentScore * 10),
    );
  }

  let timely = countHits(hay, TRENDING_TERMS) >= 1 ? 5 : 0;
  let evergreen = countHits(hay, EVERGREEN_TERMS) >= 1 ? 5 : 2;
  if (
    /\b(checklist|guide|playbook|roadmap|when should|what to|how to|patterns|fix)\b/i.test(
      `${candidate.title} ${candidate.summary}`,
    )
  ) {
    evergreen = 5;
  }

  let penalties = 0;
  const penaltyNotes: string[] = [];

  if (isOffBrandProductTopic(candidate.title, candidate.summary, candidate.keyword)) {
    penalties += 30;
    penaltyNotes.push("Primarily promotes third-party company/product");
  }

  if (serviceRelevance === 0) {
    penalties += 25;
    penaltyNotes.push("No connection to Techlyser services");
  }

  if (
    countHits(hay, NEWS_REWRITE_TERMS) >= 1 &&
    pillars.length === 0 &&
    customerHits === 0
  ) {
    penalties += 20;
    penaltyNotes.push("Looks like a pure news rewrite");
  }

  if (
    /\b(best|top)\s+\d*\s*(apps?|plugins?|tools?|saas)\b/i.test(
      `${candidate.title} ${candidate.summary}`,
    )
  ) {
    penalties += 20;
    penaltyNotes.push("Affiliate / product-list style");
  }

  if (customerRelevance === 0) {
    penalties += 15;
    penaltyNotes.push("Very low business relevance");
  }

  if (linkedinPotential <= 5 && technicalExpertise === 0 && leadPotential === 0) {
    penalties += 15;
    penaltyNotes.push("No useful actionable / discussion angle");
  }

  const raw =
    serviceRelevance +
    customerRelevance +
    seoOpportunity +
    linkedinPotential +
    technicalExpertise +
    leadPotential +
    timely +
    evergreen -
    penalties;

  const total = clamp(Math.round(raw), 0, 100);

  return {
    serviceRelevance,
    customerRelevance,
    seoOpportunity,
    linkedinPotential,
    technicalExpertise,
    leadPotential,
    timely,
    evergreen,
    penalties,
    penaltyNotes,
    total,
  };
}
