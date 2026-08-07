import type { ResearchSourceKind } from "@prisma/client";

/** Raw hit before normalization — adapters emit this shape. */
export type RawResearchHit = {
  title: string;
  url: string;
  summary?: string;
  publishedAt?: Date | string | null;
  keywords?: string[];
  category?: string;
  sourceLabel?: string;
  raw?: Record<string, unknown>;
};

export type ResearchSourceId =
  | "google-trends"
  | "shopify-blog"
  | "nextjs-blog"
  | "vercel-blog"
  | "openai"
  | "anthropic"
  | "cloudflare"
  | "google-search-central"
  | "github-trending"
  | "product-hunt"
  | "hacker-news"
  | "reddit"
  | "competitor-blogs";

export type ResearchSourceContext = {
  query?: string;
  locale?: string;
  limit?: number;
  signal?: AbortSignal;
};

export type ResearchSourceAdapter = {
  id: ResearchSourceId;
  kind: ResearchSourceKind;
  label: string;
  category: string;
  /** Collect raw hits. Must never throw uncaught — return [] on soft failure. */
  collect: (ctx: ResearchSourceContext) => Promise<RawResearchHit[]>;
};

/** Canonical normalized research result (DB-ready). */
export type NormalizedResearchResult = {
  title: string;
  url: string;
  category: string;
  keywords: string[];
  source: ResearchSourceKind;
  sourceLabel: string;
  publishedAt: Date | null;
  summary: string;
  relevanceScore: number;
  status: "NEW";
  raw?: Record<string, unknown>;
};

export type MarketResearchOptions = {
  /** Restrict to these adapter ids. Default: all registered. */
  sources?: ResearchSourceId[];
  query?: string;
  locale?: string;
  limitPerSource?: number;
  /** Optional seed keywords used for relevance scoring. */
  focusKeywords?: string[];
  /** Persist a parent Research run row. Default true. */
  createRun?: boolean;
  runTitle?: string;
  dryRun?: boolean;
};

export type MarketResearchReport = {
  researchId: string | null;
  collected: number;
  upserted: number;
  skipped: number;
  bySource: Record<string, { collected: number; upserted: number; error?: string }>;
  items: NormalizedResearchResult[];
};
