export const WRITER_PROMPT_KEYS = {
  SYSTEM_BRAND: "writer.system.brand.v1",
  ARTICLE_FULL: "writer.article.full.v1",
} as const;

export type WriterPromptKey =
  (typeof WRITER_PROMPT_KEYS)[keyof typeof WRITER_PROMPT_KEYS];
