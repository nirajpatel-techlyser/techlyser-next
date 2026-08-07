import { ResearchSourceKinds } from "../source-kinds";
import { SOURCE_FEED_URLS } from "../config";
import { rssAdapter } from "./rss";

export const googleTrendsSource = rssAdapter({
  id: "google-trends",
  kind: ResearchSourceKinds.GOOGLE_TRENDS,
  label: "Google Trends",
  category: "trends",
  feedUrl: ({ locale }) =>
    locale?.toUpperCase().includes("IN")
      ? SOURCE_FEED_URLS.googleTrendsIndia
      : SOURCE_FEED_URLS.googleTrendsUS,
});

export const shopifyBlogSource = rssAdapter({
  id: "shopify-blog",
  kind: ResearchSourceKinds.SHOPIFY_BLOG,
  label: "Shopify Blog",
  category: "ecommerce",
  feedUrl: SOURCE_FEED_URLS.shopify,
});

export const nextjsBlogSource = rssAdapter({
  id: "nextjs-blog",
  kind: ResearchSourceKinds.NEXTJS_BLOG,
  label: "Next.js Blog",
  category: "engineering",
  feedUrl: SOURCE_FEED_URLS.nextjs,
});

export const vercelBlogSource = rssAdapter({
  id: "vercel-blog",
  kind: ResearchSourceKinds.VERCEL_BLOG,
  label: "Vercel Blog",
  category: "engineering",
  feedUrl: SOURCE_FEED_URLS.vercel,
});

export const openaiSource = rssAdapter({
  id: "openai",
  kind: ResearchSourceKinds.OPENAI,
  label: "OpenAI Blog",
  category: "ai",
  feedUrl: SOURCE_FEED_URLS.openai,
});

export const cloudflareSource = rssAdapter({
  id: "cloudflare",
  kind: ResearchSourceKinds.CLOUDFLARE,
  label: "Cloudflare Blog",
  category: "infrastructure",
  feedUrl: SOURCE_FEED_URLS.cloudflare,
});

export const googleSearchCentralSource = rssAdapter({
  id: "google-search-central",
  kind: ResearchSourceKinds.GOOGLE_SEARCH_CENTRAL,
  label: "Google Search Central",
  category: "seo",
  feedUrl: SOURCE_FEED_URLS.googleSearchCentral,
});
