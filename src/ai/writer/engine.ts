import { z } from "zod";
import { slugifyTaxonomy } from "@/lib/blog-html";
import { prepareBlogHtml } from "@/lib/prepare-blog-html";
import { renderPrompt } from "@/ai/prompts/render";
import { WRITER_PROMPT_KEYS } from "./prompts";
import { callWriterLlm } from "./llm/client";
import { generateFallbackPayload } from "./llm/fallback";
import { assembleArticleHtml } from "./compose/html";
import { buildWriterSchema } from "./compose/schema";
import {
  hasLlmProvider,
  WRITER_DEFAULT_CTA,
  WRITER_LENGTH_WORD_TARGETS,
} from "./config";
import type {
  WriterInput,
  WriterLlmPayload,
  WriterOutput,
  WriterRunReport,
} from "./types";
import {
  createWriterRun,
  failWriterRun,
  completeWriterRun,
  saveWriterDraftBlog,
} from "./store";

export const writerInputSchema = z.object({
  keyword: z.string().min(2).max(200),
  audience: z.string().min(2).max(300),
  searchIntent: z.enum([
    "informational",
    "commercial",
    "transactional",
    "navigational",
  ]),
  category: z.string().min(2).max(120),
  tone: z.enum(["premium", "practical", "technical", "friendly"]),
  length: z.enum(["short", "medium", "long"]),
  contentIdeaId: z.string().optional(),
});

function normalizeSlug(raw: string, keyword: string): string {
  const base = slugifyTaxonomy(raw || keyword) || "article";
  return base.slice(0, 80);
}

function normalizePayload(
  raw: WriterLlmPayload,
  input: WriterInput,
): WriterLlmPayload {
  return {
    seoTitle: raw.seoTitle?.trim() || `${input.keyword} — Techlyser Guide`,
    metaDescription:
      raw.metaDescription?.trim() ||
      `Guide to ${input.keyword} for ${input.audience}.`,
    slug: normalizeSlug(raw.slug, input.keyword),
    outline: raw.outline?.trim() || "",
    excerpt:
      raw.excerpt?.trim() ||
      `Insights on ${input.keyword} for ${input.audience}.`,
    articleMarkdown: raw.articleMarkdown?.trim() || "",
    faqs: Array.isArray(raw.faqs)
      ? raw.faqs.filter((f) => f.question && f.answer)
      : [],
    howTo: raw.howTo?.steps?.length ? raw.howTo : null,
    comparisonTable:
      raw.comparisonTable?.headers?.length &&
      raw.comparisonTable?.rows?.length
        ? raw.comparisonTable
        : null,
    cta: {
      headline: raw.cta?.headline || WRITER_DEFAULT_CTA.headline,
      body: raw.cta?.body || WRITER_DEFAULT_CTA.body,
      buttonText: raw.cta?.buttonText || WRITER_DEFAULT_CTA.buttonText,
      href: raw.cta?.href?.startsWith("/")
        ? raw.cta.href
        : WRITER_DEFAULT_CTA.href,
    },
    featuredImagePrompt:
      raw.featuredImagePrompt?.trim() ||
      `Blog hero image about ${input.keyword}, professional ecommerce theme, no text`,
    tags: Array.isArray(raw.tags)
      ? raw.tags.map((t) => slugifyTaxonomy(String(t))).filter(Boolean)
      : [slugifyTaxonomy(input.category)].filter(Boolean),
  };
}

async function generateLlmPayload(
  input: WriterInput,
): Promise<{ payload: WriterLlmPayload; model: string; promptVersion: string }> {
  const targetWords = WRITER_LENGTH_WORD_TARGETS[input.length];

  const [system, user] = await Promise.all([
    renderPrompt({
      key: WRITER_PROMPT_KEYS.SYSTEM_BRAND,
      kind: "WRITER",
    }),
    renderPrompt({
      key: WRITER_PROMPT_KEYS.ARTICLE_FULL,
      kind: "WRITER",
      variables: {
        keyword: input.keyword,
        audience: input.audience,
        searchIntent: input.searchIntent,
        category: input.category,
        tone: input.tone,
        targetWords,
      },
    }),
  ]);

  const promptVersion = `${system.version}+${user.version}`;

  if (!hasLlmProvider()) {
    return {
      payload: normalizePayload(generateFallbackPayload(input), input),
      model: "fallback-template",
      promptVersion,
    };
  }

  const { payload, model } = await callWriterLlm(system.text, user.text);
  return {
    payload: normalizePayload(payload, input),
    model,
    promptVersion,
  };
}

export async function composeWriterOutput(
  input: WriterInput,
  payload: WriterLlmPayload,
): Promise<WriterOutput> {
  const prepared = await prepareBlogHtml(
    payload.articleMarkdown,
    null,
    payload.seoTitle,
  );

  const articleHtml = assembleArticleHtml({
    bodyHtml: prepared.html,
    toc: prepared.toc,
    faqs: payload.faqs,
    howTo: payload.howTo || undefined,
    comparisonTable: payload.comparisonTable || undefined,
    cta: payload.cta,
  });

  const readingTimeMinutes = Math.max(
    1,
    Math.ceil(prepared.wordCount / 200),
  );

  const tags = payload.tags ?? [];

  const schema = buildWriterSchema({
    seoTitle: payload.seoTitle,
    metaDescription: payload.metaDescription,
    slug: payload.slug,
    faqs: payload.faqs,
    howTo: payload.howTo || undefined,
    wordCount: prepared.wordCount,
    readingTimeMinutes,
    tags,
  });

  return {
    seoTitle: payload.seoTitle,
    metaDescription: payload.metaDescription,
    slug: payload.slug,
    outline: payload.outline,
    excerpt: payload.excerpt,
    articleHtml,
    faqs: payload.faqs,
    howTo: payload.howTo || undefined,
    comparisonTable: payload.comparisonTable || undefined,
    cta: payload.cta,
    schema,
    toc: prepared.toc,
    readingTimeMinutes,
    featuredImagePrompt: payload.featuredImagePrompt,
    wordCount: prepared.wordCount,
    tags,
  };
}

export async function generateArticleDraft(
  rawInput: WriterInput,
): Promise<WriterRunReport> {
  const input = writerInputSchema.parse(rawInput);
  const run = await createWriterRun(input);

  try {
    const { payload, model, promptVersion } = await generateLlmPayload(input);
    const output = await composeWriterOutput(input, payload);

    const { slug: uniqueSlug, blogId } = await saveWriterDraftBlog({
      input,
      output,
      runId: run.id,
    });

    output.slug = uniqueSlug;

    await completeWriterRun({
      runId: run.id,
      output,
      model,
      promptVersion,
      blogId,
    });

    return {
      runId: run.id,
      blogId,
      slug: uniqueSlug,
      seoTitle: output.seoTitle,
      readingTimeMinutes: output.readingTimeMinutes,
      output,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Writer failed";
    await failWriterRun(run.id, message);
    throw err;
  }
}

export function createWriterService() {
  return {
    generate: generateArticleDraft,
    compose: composeWriterOutput,
  };
}
