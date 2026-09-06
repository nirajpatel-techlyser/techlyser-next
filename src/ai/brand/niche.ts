/**
 * Techlyser content niche — Shopify store growth, not third-party SaaS promo.
 * Used by topic picking, planner, opportunity scoring, and research focus.
 */

/** Must match at least one commerce anchor to be eligible for autopilot. */
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
] as const;

/** Growth / delivery themes we want to own for Techlyser authority. */
export const GROWTH_PRACTICE_TERMS = [
  "cro",
  "conversion rate",
  "conversion optimization",
  "a/b test",
  "a/b testing",
  "ab test",
  "ab testing",
  "split test",
  "geo",
  "aeo",
  "generative engine optimization",
  "answer engine",
  "ai search",
  "core web vitals",
  "page speed",
  "checkout",
  "cart abandonment",
  "product page",
  "pdp",
  "landing page",
  "headless",
  "hydrogen",
  "liquid",
  "theme customization",
  "shopify app",
  "shopify plus",
  "migration",
  "founder",
  "developers",
  "agency",
] as const;

/** Expanded focus list for research + opportunity scoring. */
export const TECHLYSER_CONTENT_FOCUS = [
  ...COMMERCE_ANCHORS,
  ...GROWTH_PRACTICE_TERMS,
  "next.js",
  "nextjs",
  "headless commerce",
  "india",
  "gst",
  "woocommerce",
  "wordpress",
  "seo",
  "aeo",
] as const;

/** GitHub owner/repo style titles and pure product dumps we never want as blog heroes. */
const REPO_TITLE_RE = /^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i;

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
  return BLOCKED_PRODUCT_MARKERS.some((marker) => hay.includes(marker));
}

export function hasCommerceAnchor(
  ...parts: Array<string | null | undefined>
): boolean {
  const hay = haystackOf(...parts);
  return COMMERCE_ANCHORS.some((term) => hay.includes(term));
}

/**
 * Eligible for Techlyser autopilot / planner: commerce-anchored topics only.
 * Growth practices alone (e.g. generic "A/B testing") are not enough without Shopify/ecommerce context.
 */
export function isTechlyserNicheTopic(
  ...parts: Array<string | null | undefined>
): boolean {
  if (isOffBrandProductTopic(...parts)) return false;
  return hasCommerceAnchor(...parts);
}

export const DEFAULT_TECHLYSER_AUDIENCE =
  "Shopify founders, D2C brand operators, ecommerce marketers, and Shopify developers focused on CRO, GEO/AEO, A/B testing, and store growth";
