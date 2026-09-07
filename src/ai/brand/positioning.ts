/**
 * Official Techlyser brand positioning for content automation.
 * Services/URLs must match real project routes — never invent pages.
 */

import { services } from "@/data/services";

export const TECHLYSER_POSITIONING = `Techlyser is a modern full-stack web design and development agency that helps businesses build scalable, high-performance, conversion-focused digital experiences.`;

/** Official service titles from src/data/services.ts */
export const TECHLYSER_SERVICE_TITLES = services.map((s) => s.title);

/** Only URLs that exist in this Next.js app. */
export const TECHLYSER_INTERNAL_URLS = [
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

export type ContentPillarId =
  | "web-development"
  | "web-design-ux"
  | "ecommerce"
  | "ai-web"
  | "seo-organic"
  | "business-technology";

export const CONTENT_PILLARS: Record<
  ContentPillarId,
  { label: string; terms: readonly string[]; goal: string }
> = {
  "web-development": {
    label: "Web Development",
    terms: [
      "full-stack",
      "full stack",
      "web development",
      "next.js",
      "nextjs",
      "react",
      "node.js",
      "nodejs",
      "api",
      "architecture",
      "scalable",
      "performance",
      "maintainability",
      "frontend",
      "backend",
      "custom web",
      "web application",
    ],
    goal: "Attract businesses needing development partners",
  },
  "web-design-ux": {
    label: "Web Design & UX",
    terms: [
      "ux",
      "ui",
      "user experience",
      "landing page",
      "responsive",
      "mobile ux",
      "redesign",
      "accessibility",
      "navigation",
      "checkout ux",
      "design system",
      "user journey",
      "conversion-focused design",
      "website design",
    ],
    goal: "Attract businesses that need better websites and experiences",
  },
  ecommerce: {
    label: "Ecommerce",
    terms: [
      "shopify",
      "ecommerce",
      "e-commerce",
      "d2c",
      "dtc",
      "product page",
      "pdp",
      "collection",
      "checkout",
      "storefront",
      "woocommerce",
      "cart abandonment",
      "product discovery",
    ],
    goal: "Help merchants build scalable, converting storefronts",
  },
  "ai-web": {
    label: "AI + Web",
    terms: [
      "ai seo",
      "ai search",
      "llm",
      "geo",
      "aeo",
      "llmo",
      "ai commerce",
      "ai-powered",
      "ai integration",
      "chat interface",
      "structured data",
      "automation",
      "ai agent",
      "generative",
    ],
    goal: "Position Techlyser as a forward-looking technical agency",
  },
  "seo-organic": {
    label: "SEO + Organic Growth",
    terms: [
      "seo",
      "technical seo",
      "core web vitals",
      "schema",
      "structured data",
      "internal linking",
      "search intent",
      "crawlability",
      "indexing",
      "organic",
      "page speed",
    ],
    goal: "Generate long-term organic search traffic",
  },
  "business-technology": {
    label: "Business + Technology",
    terms: [
      "rebuild",
      "modernis",
      "moderniz",
      "roi",
      "digital transformation",
      "custom software",
      "saas vs",
      "scalability",
      "outdated website",
      "business process",
      "technology decision",
      "website roi",
    ],
    goal: "Target founders and decision-makers",
  },
};

export const TARGET_AUDIENCE_PROFILE =
  "startup founders, SME owners, ecommerce/D2C brands, SaaS companies, agencies needing partners, and businesses with outdated, slow, or low-converting websites who need custom development, Shopify/Next.js/WordPress work, SEO, CRO, or AI integration";

export const SERVICE_RELEVANCE_TERMS = [
  "shopify",
  "next.js",
  "nextjs",
  "wordpress",
  "woocommerce",
  "ui",
  "ux",
  "design",
  "performance",
  "seo",
  "cro",
  "conversion",
  "ecommerce",
  "full-stack",
  "full stack",
  "web development",
  "api",
  "integration",
  "ai",
  "headless",
  "migration",
  "redesign",
  "audit",
] as const;

export function detectContentPillars(
  ...parts: Array<string | null | undefined>
): ContentPillarId[] {
  const hay = parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const matched: ContentPillarId[] = [];
  for (const [id, pillar] of Object.entries(CONTENT_PILLARS) as Array<
    [ContentPillarId, (typeof CONTENT_PILLARS)[ContentPillarId]]
  >) {
    if (pillar.terms.some((t) => hay.includes(t))) matched.push(id);
  }
  return matched;
}

export function isAllowedInternalHref(href: string): boolean {
  const path = href.trim().split("?")[0]?.split("#")[0] || "";
  if (!path.startsWith("/")) return false;
  return TECHLYSER_INTERNAL_URLS.some(
    (allowed) => path === allowed || path.startsWith(`${allowed}/`),
  );
}

export function formatServicesForPrompt(): string {
  return services
    .map((s) => `- ${s.title} (${s.href}): ${s.description}`)
    .join("\n");
}

export function formatInternalUrlsForPrompt(): string {
  return TECHLYSER_INTERNAL_URLS.join(", ");
}
