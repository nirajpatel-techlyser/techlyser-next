export const PROMPT_KEYS = {
  RESEARCH_BRIEF: "research.brief.v1",
  PLANNER_CLUSTER: "planner.cluster.v1",
  WRITER_SYSTEM_BRAND: "writer.system.brand.v1",
  WRITER_ARTICLE_FULL: "writer.article.full.v1",
  SEO_METADATA: "seo.metadata.v1",
  GEO_PASSAGES: "geo.passages.v1",
  SYSTEM_BRAND: "system.brand.v1",
} as const;

export type PromptKey = (typeof PROMPT_KEYS)[keyof typeof PROMPT_KEYS];
