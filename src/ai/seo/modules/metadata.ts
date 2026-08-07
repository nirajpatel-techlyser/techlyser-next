import {
  SEO_DESC_MAX,
  SEO_DESC_MIN,
  SEO_TITLE_MAX,
} from "../config";
import type { SeoMetadataResult, SeoModuleContext } from "../types";

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function optimizeMetadata(ctx: SeoModuleContext): SeoMetadataResult {
  const issues: string[] = [];
  const keyword = ctx.primaryKeyword.trim();

  let seoTitle = (ctx.title || keyword).trim();
  if (seoTitle.length > SEO_TITLE_MAX) {
    seoTitle = seoTitle.slice(0, SEO_TITLE_MAX - 1).replace(/\s+\S*$/, "").trim();
    issues.push(`Title truncated to ${SEO_TITLE_MAX} characters`);
  }
  if (keyword && !seoTitle.toLowerCase().includes(keyword.toLowerCase().slice(0, 24))) {
    const withKw = `${keyword} | ${seoTitle}`.slice(0, SEO_TITLE_MAX);
    seoTitle = withKw;
    issues.push("Primary keyword injected into title");
  }

  const plain = stripHtml(ctx.content);
  let seoDescription =
    ctx.excerpt?.trim() ||
    plain.slice(0, SEO_DESC_MAX).replace(/\s+\S*$/, "").trim();

  if (seoDescription.length < SEO_DESC_MIN && plain.length > seoDescription.length) {
    seoDescription = plain.slice(0, SEO_DESC_MAX).replace(/\s+\S*$/, "").trim();
  }
  if (seoDescription.length > SEO_DESC_MAX) {
    seoDescription = seoDescription.slice(0, SEO_DESC_MAX - 1).replace(/\s+\S*$/, "").trim();
    issues.push(`Meta description truncated to ${SEO_DESC_MAX} characters`);
  }
  if (keyword && !seoDescription.toLowerCase().includes(keyword.toLowerCase().slice(0, 20))) {
    seoDescription = `${keyword}: ${seoDescription}`.slice(0, SEO_DESC_MAX);
    issues.push("Primary keyword injected into meta description");
  }

  const metaKeywords = Array.from(
    new Set(
      [keyword, ctx.category || "", ...ctx.tags]
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 12);

  return { seoTitle, seoDescription, metaKeywords, issues };
}
