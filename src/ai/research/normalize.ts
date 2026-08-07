import { DEFAULT_FOCUS_KEYWORDS } from "./config";
import type { NormalizedResearchResult, RawResearchHit } from "./types";
import type { ResearchSourceKind } from "@prisma/client";

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function canonicalizeUrl(url: string): string {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = "";
    // Strip common tracking params
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"].forEach(
      (key) => parsed.searchParams.delete(key),
    );
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

function extractKeywords(
  title: string,
  summary: string,
  explicit: string[] | undefined,
  focus: string[],
): string[] {
  const bag = new Set<string>();
  for (const k of explicit || []) {
    const cleaned = k.trim().toLowerCase();
    if (cleaned) bag.add(cleaned);
  }

  const haystack = `${title} ${summary}`.toLowerCase();
  for (const focusTerm of focus) {
    if (haystack.includes(focusTerm.toLowerCase())) {
      bag.add(focusTerm.toLowerCase());
    }
  }

  return [...bag].slice(0, 16);
}

export function scoreRelevance(input: {
  title: string;
  summary: string;
  keywords: string[];
  focusKeywords?: string[];
  publishedAt?: Date | null;
}): number {
  const focus = (input.focusKeywords?.length
    ? input.focusKeywords
    : [...DEFAULT_FOCUS_KEYWORDS]
  ).map((k) => k.toLowerCase());

  const haystack = `${input.title} ${input.summary} ${input.keywords.join(" ")}`.toLowerCase();
  let score = 0.15;

  for (const term of focus) {
    if (haystack.includes(term)) {
      score += term.split(" ").length > 1 ? 0.12 : 0.08;
    }
  }

  // Recency boost (last 30 days)
  if (input.publishedAt) {
    const ageDays =
      (Date.now() - input.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays <= 7) score += 0.2;
    else if (ageDays <= 30) score += 0.12;
    else if (ageDays <= 90) score += 0.05;
  }

  return Math.max(0, Math.min(1, Number(score.toFixed(3))));
}

export function normalizeHit(input: {
  hit: RawResearchHit;
  source: ResearchSourceKind;
  sourceLabel: string;
  defaultCategory: string;
  focusKeywords?: string[];
}): NormalizedResearchResult {
  const title = input.hit.title.trim().replace(/\s+/g, " ");
  const url = canonicalizeUrl(input.hit.url);
  const summary = (input.hit.summary || title).trim().slice(0, 1000);
  const publishedAt = toDate(input.hit.publishedAt);
  const focus = input.focusKeywords?.length
    ? input.focusKeywords
    : [...DEFAULT_FOCUS_KEYWORDS];
  const keywords = extractKeywords(title, summary, input.hit.keywords, focus);
  const relevanceScore = scoreRelevance({
    title,
    summary,
    keywords,
    focusKeywords: focus,
    publishedAt,
  });

  return {
    title,
    url,
    category: (input.hit.category || input.defaultCategory).trim(),
    keywords,
    source: input.source,
    sourceLabel: input.hit.sourceLabel || input.sourceLabel,
    publishedAt,
    summary,
    relevanceScore,
    status: "NEW",
    raw: input.hit.raw,
  };
}

export function normalizeHits(input: {
  hits: RawResearchHit[];
  source: ResearchSourceKind;
  sourceLabel: string;
  defaultCategory: string;
  focusKeywords?: string[];
}): NormalizedResearchResult[] {
  const seen = new Set<string>();
  const out: NormalizedResearchResult[] = [];

  for (const hit of input.hits) {
    if (!hit.title?.trim() || !hit.url?.trim()) continue;
    const normalized = normalizeHit({
      hit,
      source: input.source,
      sourceLabel: input.sourceLabel,
      defaultCategory: input.defaultCategory,
      focusKeywords: input.focusKeywords,
    });
    if (seen.has(normalized.url)) continue;
    seen.add(normalized.url);
    out.push(normalized);
  }

  return out;
}
