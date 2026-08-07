import type { ResearchSourceId } from "./types";

/** Default Techlyser growth focus terms for relevance scoring. */
export const DEFAULT_FOCUS_KEYWORDS = [
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
] as const;

export const RESEARCH_USER_AGENT =
  process.env.RESEARCH_USER_AGENT ||
  "TechlyserResearchBot/1.0 (+https://techlyser.com; research@techlyser.com)";

export const DEFAULT_LIMIT_PER_SOURCE = 12;

export const SOURCE_FEED_URLS = {
  shopify: "https://www.shopify.com/blog.atom",
  nextjs: "https://nextjs.org/feed.xml",
  vercel: "https://vercel.com/atom",
  openai: "https://openai.com/blog/rss.xml",
  anthropic: "https://raw.githubusercontent.com/anthropics/anthropic-cookbook/main/README.md",
  cloudflare: "https://blog.cloudflare.com/rss/",
  googleSearchCentral: "https://developers.google.com/search/blog/feeds/posts/default?alt=rss",
  googleTrendsIndia: "https://trends.google.com/trending/rss?geo=IN",
  googleTrendsUS: "https://trends.google.com/trending/rss?geo=US",
} as const;

export const REDDIT_SUBREDDITS = [
  "shopify",
  "ecommerce",
  "webdev",
  "nextjs",
  "SEO",
] as const;

export const HN_TOPIC_HINTS = [
  "shopify",
  "next.js",
  "nextjs",
  "vercel",
  "seo",
  "ecommerce",
  "headless",
  "cloudflare",
] as const;

/** Competitor RSS path guesses when Competitor.pageUrl is a homepage. */
export const COMPETITOR_FEED_CANDIDATES = [
  "/blog/feed",
  "/blog/rss",
  "/blog/rss.xml",
  "/feed",
  "/rss",
  "/rss.xml",
  "/atom.xml",
  "/index.xml",
] as const;

export function isSourceEnabled(id: ResearchSourceId): boolean {
  const disabled = (process.env.RESEARCH_DISABLED_SOURCES || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return !disabled.includes(id);
}
