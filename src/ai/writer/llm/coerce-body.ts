import { jsonrepair } from "jsonrepair";
import type { WriterFaq, WriterLlmPayload } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function tryParseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) return null;

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  const candidates = [trimmed];
  if (start >= 0 && end > start) {
    candidates.push(trimmed.slice(start, end + 1));
  }

  for (const candidate of candidates) {
    for (const parse of [
      (value: string) => JSON.parse(value),
      (value: string) => JSON.parse(jsonrepair(value)),
    ]) {
      try {
        const parsed = parse(candidate);
        if (isRecord(parsed)) return parsed;
      } catch {
        // try next parser
      }
    }
  }

  return null;
}

function stripCodeFences(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:markdown|md|json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function htmlToPlainText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

/** Extract writer JSON embedded inside HTML (legacy broken saves). */
export function extractEmbeddedWriterJsonFromHtml(
  html: string,
): Record<string, unknown> | null {
  if (
    !html.includes("seoTitle") &&
    !html.includes("&quot;seoTitle&quot;") &&
    !html.includes("articleMarkdown")
  ) {
    return null;
  }

  const plain = htmlToPlainText(html);
  const start = plain.indexOf("{");
  const end = plain.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  const candidate = plain.slice(start, end + 1);
  for (const parse of [
    (value: string) => JSON.parse(value),
    (value: string) => JSON.parse(jsonrepair(value)),
  ]) {
    try {
      const parsed = parse(candidate);
      if (isRecord(parsed) && typeof parsed.articleMarkdown === "string") {
        return parsed;
      }
    } catch {
      // try next parser
    }
  }

  return null;
}

export function articleHtmlLooksLikeEmbeddedJson(html: string): boolean {
  return Boolean(extractEmbeddedWriterJsonFromHtml(html));
}

/** Gemini sometimes returns a full writer JSON blob instead of markdown. */
export function coerceArticleMarkdown(raw: string): string {
  const stripped = stripCodeFences(raw);
  const embedded = tryParseJsonObject(stripped);

  if (
    embedded &&
    typeof embedded.articleMarkdown === "string" &&
    embedded.articleMarkdown.trim()
  ) {
    return embedded.articleMarkdown.trim();
  }

  return stripped;
}

function pickString(primary?: string | null, fallback?: unknown): string | undefined {
  const value = primary?.trim();
  if (value) return value;
  return typeof fallback === "string" && fallback.trim() ? fallback.trim() : undefined;
}

function pickFaqs(primary: WriterFaq[], fallback: unknown): WriterFaq[] {
  if (primary.length) return primary;
  if (!Array.isArray(fallback)) return [];
  return fallback.filter(
    (item): item is WriterFaq =>
      isRecord(item) &&
      typeof item.question === "string" &&
      typeof item.answer === "string",
  );
}

/** Merge fields when articleMarkdown accidentally contains the full LLM JSON payload. */
export function unwrapEmbeddedWriterPayload(raw: WriterLlmPayload): WriterLlmPayload {
  const fromHtml = extractEmbeddedWriterJsonFromHtml(raw.articleMarkdown ?? "");
  const embedded =
    fromHtml ?? tryParseJsonObject(raw.articleMarkdown?.trim() ?? "");
  if (!embedded) {
    return {
      ...raw,
      articleMarkdown: coerceArticleMarkdown(raw.articleMarkdown ?? ""),
    };
  }

  return {
    ...raw,
    seoTitle: pickString(raw.seoTitle, embedded.seoTitle) ?? raw.seoTitle,
    metaDescription:
      pickString(raw.metaDescription, embedded.metaDescription) ??
      raw.metaDescription,
    slug: pickString(raw.slug, embedded.slug) ?? raw.slug,
    outline: pickString(raw.outline, embedded.outline) ?? raw.outline,
    excerpt: pickString(raw.excerpt, embedded.excerpt) ?? raw.excerpt,
    articleMarkdown: coerceArticleMarkdown(
      pickString(raw.articleMarkdown, embedded.articleMarkdown) ??
        raw.articleMarkdown ??
        "",
    ),
    faqs: pickFaqs(raw.faqs ?? [], embedded.faqs),
    howTo: raw.howTo ?? (isRecord(embedded.howTo) ? (embedded.howTo as WriterLlmPayload["howTo"]) : null),
    comparisonTable:
      raw.comparisonTable ??
      (isRecord(embedded.comparisonTable)
        ? (embedded.comparisonTable as WriterLlmPayload["comparisonTable"])
        : null),
    cta:
      raw.cta ??
      (isRecord(embedded.cta)
        ? (embedded.cta as WriterLlmPayload["cta"])
        : raw.cta),
    featuredImagePrompt:
      pickString(raw.featuredImagePrompt, embedded.featuredImagePrompt) ??
      raw.featuredImagePrompt,
    tags:
      raw.tags?.length
        ? raw.tags
        : Array.isArray(embedded.tags)
          ? embedded.tags.map(String)
          : raw.tags,
    linkedinPersonalPost:
      pickString(raw.linkedinPersonalPost, embedded.linkedinPersonalPost) ??
      raw.linkedinPersonalPost,
    linkedinPagePost:
      pickString(raw.linkedinPagePost, embedded.linkedinPagePost) ??
      raw.linkedinPagePost,
  };
}
