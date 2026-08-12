import type { TocItem } from "@/lib/blog-html";

export type WriterSearchIntent =
  | "informational"
  | "commercial"
  | "transactional"
  | "navigational";

export type WriterTone = "premium" | "practical" | "technical" | "friendly";

export type WriterLength = "short" | "medium" | "long";

export type WriterInput = {
  keyword: string;
  audience: string;
  searchIntent: WriterSearchIntent;
  category: string;
  tone: WriterTone;
  length: WriterLength;
  contentIdeaId?: string;
};

export type WriterFaq = {
  question: string;
  answer: string;
};

export type WriterHowTo = {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
};

export type WriterComparisonTable = {
  headers: string[];
  rows: string[][];
};

export type WriterCta = {
  headline: string;
  body: string;
  buttonText: string;
  href: string;
};

/** Raw LLM JSON payload before HTML/schema assembly. */
export type WriterLlmPayload = {
  seoTitle: string;
  metaDescription: string;
  slug: string;
  outline: string;
  excerpt: string;
  articleMarkdown: string;
  faqs: WriterFaq[];
  howTo?: WriterHowTo | null;
  comparisonTable?: WriterComparisonTable | null;
  cta: WriterCta;
  featuredImagePrompt: string;
  tags?: string[];
  linkedinPersonalPost?: string;
  linkedinPagePost?: string;
};

export type WriterOutput = {
  seoTitle: string;
  metaDescription: string;
  slug: string;
  outline: string;
  excerpt: string;
  articleHtml: string;
  faqs: WriterFaq[];
  howTo?: WriterHowTo;
  comparisonTable?: WriterComparisonTable;
  cta: WriterCta;
  schema: Record<string, unknown>[];
  toc: TocItem[];
  readingTimeMinutes: number;
  featuredImagePrompt: string;
  wordCount: number;
  tags: string[];
  linkedinPersonalPostHtml: string;
  linkedinPagePostHtml: string;
};

export type WriterRunReport = {
  runId: string;
  blogId: string;
  slug: string;
  seoTitle: string;
  readingTimeMinutes: number;
  output: WriterOutput;
};
