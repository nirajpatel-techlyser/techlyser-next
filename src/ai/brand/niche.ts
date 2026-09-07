/**
 * Techlyser content niche — brand-growth topics across official pillars.
 * Third-party products are research inputs, never the marketing hero.
 */

import {
  detectContentPillars,
  SERVICE_RELEVANCE_TERMS,
  TARGET_AUDIENCE_PROFILE,
} from "./positioning";

export {
  TARGET_AUDIENCE_PROFILE as DEFAULT_TECHLYSER_AUDIENCE,
} from "./positioning";

/** Commerce / platform anchors (still valuable, not exclusive). */
export const COMMERCE_ANCHORS = [
  "shopify",
  "shopify plus",
  "ecommerce",
  "e-commerce",
  "e commerce",
  "d2c",
  "dtc",
  "direct-to-consumer",
  "online store",
  "online retail",
  "storefront",
  "woocommerce",
] as const;

export const GROWTH_PRACTICE_TERMS = [
  ...SERVICE_RELEVANCE_TERMS,
  "cro",
  "conversion rate",
  "a/b test",
  "a/b testing",
  "ab testing",
  "geo",
  "aeo",
  "llmo",
  "core web vitals",
  "checkout",
  "cart abandonment",
  "landing page",
  "hydrogen",
  "liquid",
  "founder",
  "agency",
  "redesign",
  "modernis",
  "moderniz",
] as const;

export const TECHLYSER_CONTENT_FOCUS = [
  ...COMMERCE_ANCHORS,
  ...GROWTH_PRACTICE_TERMS,
  "india",
  "gst",
  "react",
  "node.js",
] as const;

const REPO_TITLE_RE = /^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i;

/** Patterns that usually mean third-party promotion is the hero. */
const THIRD_PARTY_PROMO_PATTERNS = [
  /\bbest\s+\w+\s+apps?\b/i,
  /\btop\s+\d+\s+(apps?|plugins?|tools?|saas)\b/i,
  /\b\d+\s+best\s+(apps?|plugins?|tools?)\b/i,
  /\bproduct\s+review\b/i,
  /\baffiliate\b/i,
  /\bhow\s+to\s+install\b/i,
  /\bself[- ]host\b/i,
  /\blaunched\b.*\bamazing\b/i,
] as const;

const BLOCKED_PRODUCT_MARKERS = [
  "cal.com",
  "cal.diy",
  "calcom/",
  "supabase/",
  "appwrite/",
  "shadcn",
  "coolify",
  "payloadcms/",
  "langgenius/",
  "prompts.chat",
  "chatgpt prompts",
] as const;

export function haystackOf(...parts: Array<string | null | undefined>): string {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function isOffBrandProductTopic(
  ...parts: Array<string | null | undefined>
): boolean {
  const title = (parts[0] || "").trim();
  if (REPO_TITLE_RE.test(title)) return true;
  const hay = haystackOf(...parts);
  if (BLOCKED_PRODUCT_MARKERS.some((marker) => hay.includes(marker))) {
    return true;
  }
  const joined = parts.filter(Boolean).join(" ");
  return THIRD_PARTY_PROMO_PATTERNS.some((re) => re.test(joined));
}

export function hasCommerceAnchor(
  ...parts: Array<string | null | undefined>
): boolean {
  const hay = haystackOf(...parts);
  return COMMERCE_ANCHORS.some((term) => hay.includes(term));
}

/**
 * Eligible when tied to a Techlyser content pillar and not a third-party promo dump.
 */
export function isTechlyserNicheTopic(
  ...parts: Array<string | null | undefined>
): boolean {
  if (isOffBrandProductTopic(...parts)) return false;
  const pillars = detectContentPillars(...parts);
  if (pillars.length > 0) return true;
  // Fallback: service-relevance terms without a named pillar match
  const hay = haystackOf(...parts);
  return SERVICE_RELEVANCE_TERMS.some((t) => hay.includes(t));
}

export { TARGET_AUDIENCE_PROFILE };
