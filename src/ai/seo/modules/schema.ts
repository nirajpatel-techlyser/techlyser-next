import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  siteConfig,
} from "@/lib/seo";
import { estimateWordCount } from "@/lib/blog-html";
import type {
  SeoCanonicalResult,
  SeoFaqResult,
  SeoMetadataResult,
  SeoModuleContext,
  SeoSchemaResult,
} from "../types";

export function optimizeSchema(input: {
  ctx: SeoModuleContext;
  metadata: SeoMetadataResult;
  canonical: SeoCanonicalResult;
  faq: SeoFaqResult;
  contentHtml: string;
}): SeoSchemaResult {
  const issues: string[] = [];
  const wordCount = estimateWordCount(input.contentHtml);
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const now = new Date().toISOString();

  const jsonLd: Record<string, unknown>[] = [
    blogPostingJsonLd({
      title: input.metadata.seoTitle,
      description: input.metadata.seoDescription,
      slug: input.ctx.slug.replace(/^\/+/, ""),
      image: input.ctx.featuredImage || undefined,
      datePublished: input.ctx.publishedAt || now,
      dateModified: now,
      author: siteConfig.name,
      keywords: input.metadata.metaKeywords,
      wordCount,
      readingTimeMinutes,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      {
        name: input.metadata.seoTitle,
        path: input.canonical.canonicalPath,
      },
    ]),
  ];

  if (input.faq.faqs.length > 0) {
    jsonLd.push(faqPageJsonLd(input.faq.faqs));
  } else {
    issues.push("No FAQ schema emitted");
  }

  const schemaTypes = jsonLd
    .map((node) => String(node["@type"] || ""))
    .filter(Boolean);

  return { jsonLd, schemaTypes, issues };
}

/** Alias module for explicit JSON-LD step in the pipeline. */
export function optimizeJsonLd(
  schema: SeoSchemaResult,
): SeoSchemaResult {
  return schema;
}
