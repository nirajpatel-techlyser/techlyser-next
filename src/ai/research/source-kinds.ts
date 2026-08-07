/**
 * Research source kind constants (string literals matching Prisma ResearchSourceKind).
 * Prefer these over `@prisma/client` enum *values* at module top-level so Turbopack
 * never resolves Prisma's browser stub (where enums are undefined).
 */

export const ResearchSourceKinds = {
  GOOGLE_TRENDS: "GOOGLE_TRENDS",
  SHOPIFY_BLOG: "SHOPIFY_BLOG",
  NEXTJS_BLOG: "NEXTJS_BLOG",
  VERCEL_BLOG: "VERCEL_BLOG",
  OPENAI: "OPENAI",
  ANTHROPIC: "ANTHROPIC",
  CLOUDFLARE: "CLOUDFLARE",
  GOOGLE_SEARCH_CENTRAL: "GOOGLE_SEARCH_CENTRAL",
  GITHUB_TRENDING: "GITHUB_TRENDING",
  PRODUCT_HUNT: "PRODUCT_HUNT",
  HACKER_NEWS: "HACKER_NEWS",
  REDDIT: "REDDIT",
  COMPETITOR_BLOG: "COMPETITOR_BLOG",
  OTHER: "OTHER",
} as const;

export type ResearchSourceKindValue =
  (typeof ResearchSourceKinds)[keyof typeof ResearchSourceKinds];
