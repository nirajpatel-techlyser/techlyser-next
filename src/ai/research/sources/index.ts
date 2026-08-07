import type { ResearchSourceAdapter, ResearchSourceId } from "../types";
import { isSourceEnabled } from "../config";
import {
  cloudflareSource,
  googleSearchCentralSource,
  googleTrendsSource,
  nextjsBlogSource,
  openaiSource,
  shopifyBlogSource,
  vercelBlogSource,
} from "./rss-blogs";
import { anthropicSource } from "./anthropic";
import { githubTrendingSource, hackerNewsSource } from "./github-hn";
import { productHuntSource, redditSource } from "./community";
import { competitorBlogsSource } from "./competitors";

export const RESEARCH_SOURCE_REGISTRY: ResearchSourceAdapter[] = [
  googleTrendsSource,
  shopifyBlogSource,
  nextjsBlogSource,
  vercelBlogSource,
  openaiSource,
  anthropicSource,
  cloudflareSource,
  googleSearchCentralSource,
  githubTrendingSource,
  productHuntSource,
  hackerNewsSource,
  redditSource,
  competitorBlogsSource,
];

export function getResearchSources(
  ids?: ResearchSourceId[],
): ResearchSourceAdapter[] {
  const enabled = RESEARCH_SOURCE_REGISTRY.filter((source) =>
    isSourceEnabled(source.id),
  );

  if (!ids?.length) return enabled;
  const wanted = new Set(ids);
  return enabled.filter((source) => wanted.has(source.id));
}

export function listResearchSourceIds(): ResearchSourceId[] {
  return RESEARCH_SOURCE_REGISTRY.map((source) => source.id);
}
