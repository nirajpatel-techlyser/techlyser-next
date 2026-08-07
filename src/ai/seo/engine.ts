import { z } from "zod";
import { slugifyTaxonomy } from "@/lib/blog-html";
import {
  optimizeAltText,
  optimizeCanonical,
  optimizeFaq,
  optimizeHeadings,
  optimizeInternalLinks,
  optimizeJsonLd,
  optimizeMetadata,
  optimizeOpenGraph,
  optimizeSchema,
  optimizeTwitter,
} from "./modules";
import type {
  SeoModuleId,
  SeoModuleContext,
  SeoOptimizeInput,
  SeoOptimizeOutput,
} from "./types";
import {
  createSeoGeoRun,
  completeSeoGeoRun,
  failSeoGeoRun,
  applySeoGeoToBlog,
  loadBlogForSeo,
} from "./store";
import { optimizeGeo } from "@/ai/geo/engine";
import type { GeoOptimizeOutput } from "@/ai/geo/types";

export const seoOptimizeInputSchema = z.object({
  blogId: z.string().optional(),
  title: z.string().min(2).optional(),
  content: z.string().optional(),
  slug: z.string().optional(),
  excerpt: z.string().nullable().optional(),
  primaryKeyword: z.string().min(2).max(200),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().nullable().optional(),
  clusterPath: z.string().optional(),
  apply: z.boolean().optional(),
});

function scoreSeo(output: Omit<SeoOptimizeOutput, "score" | "modules" | "issues">): number {
  let score = 40;
  if (output.metadata.seoTitle.length >= 20) score += 8;
  if (output.metadata.seoDescription.length >= 120) score += 8;
  if (output.headings.hierarchyValid) score += 10;
  if (output.headings.toc.length >= 3) score += 6;
  if (output.altText.imagesWithoutAlt === 0 || output.altText.imagesFixed >= 0) score += 4;
  if (output.faq.faqs.length >= 3) score += 8;
  if (output.internalLinks.links.length >= 2) score += 8;
  if (output.schema.schemaTypes.includes("BlogPosting")) score += 4;
  if (output.schema.schemaTypes.includes("FAQPage")) score += 4;
  return Math.min(100, score);
}

export function runSeoModules(ctx: SeoModuleContext): SeoOptimizeOutput {
  const metadata = optimizeMetadata(ctx);
  const canonical = optimizeCanonical(ctx);
  const headings = optimizeHeadings(ctx);

  const afterHeadings = headings.optimizedHtml || ctx.content;
  const altText = optimizeAltText({ ...ctx, content: afterHeadings });
  let optimizedContent = altText.optimizedHtml || afterHeadings;

  const faq = optimizeFaq({ ...ctx, content: optimizedContent });
  const internalLinks = optimizeInternalLinks({ ...ctx, content: optimizedContent });

  if (
    internalLinks.suggestedHtmlSnippet &&
    !/related-internal-links/i.test(optimizedContent)
  ) {
    optimizedContent = `${optimizedContent}\n\n${internalLinks.suggestedHtmlSnippet}`;
  }

  if (faq.faqHtml && !/faq-section/i.test(optimizedContent)) {
    optimizedContent = `${optimizedContent}\n\n${faq.faqHtml}`;
  }

  const openGraph = optimizeOpenGraph({ ctx, metadata, canonical });
  const twitter = optimizeTwitter({ metadata, openGraph });
  const schema = optimizeJsonLd(
    optimizeSchema({
      ctx,
      metadata,
      canonical,
      faq,
      contentHtml: optimizedContent,
    }),
  );

  const modules: SeoModuleId[] = [
    "metadata",
    "canonical",
    "headings",
    "altText",
    "faq",
    "internalLinks",
    "openGraph",
    "twitter",
    "schema",
    "jsonLd",
  ];

  const issues = [
    ...metadata.issues,
    ...headings.issues,
    ...altText.issues,
    ...faq.issues,
    ...internalLinks.issues,
    ...schema.issues,
  ];

  const partial = {
    metadata,
    canonical,
    headings,
    altText,
    faq,
    internalLinks,
    openGraph,
    twitter,
    schema,
    optimizedContent,
  };

  return {
    ...partial,
    modules,
    score: scoreSeo(partial),
    issues,
  };
}

export type SeoGeoReport = {
  runId: string;
  blogId?: string;
  applied: boolean;
  seo: SeoOptimizeOutput;
  geo: GeoOptimizeOutput;
};

export async function optimizeSeoAndGeo(
  raw: z.infer<typeof seoOptimizeInputSchema>,
): Promise<SeoGeoReport> {
  const parsed = seoOptimizeInputSchema.parse(raw);

  let title = parsed.title || "";
  let content = parsed.content || "";
  let slug = parsed.slug || "";
  let excerpt = parsed.excerpt;
  let category = parsed.category;
  let tags = parsed.tags || [];
  let featuredImage = parsed.featuredImage;
  let blogId = parsed.blogId;

  if (blogId) {
    const blog = await loadBlogForSeo(blogId);
    if (!blog) throw new Error(`Blog not found: ${blogId}`);
    title = title || blog.title;
    content = content || blog.content;
    slug = slug || blog.slug;
    excerpt = excerpt ?? blog.excerpt;
    category = category ?? blog.category;
    tags = tags.length ? tags : blog.tags;
    featuredImage = featuredImage ?? blog.featuredImage;
  }

  if (!title || !content) {
    throw new Error("title and content are required (or provide blogId)");
  }

  if (!slug) {
    slug = slugifyTaxonomy(parsed.primaryKeyword || title) || "article";
  }

  const run = await createSeoGeoRun({
    blogId,
    primaryKeyword: parsed.primaryKeyword,
    apply: Boolean(parsed.apply),
  });

  try {
    const ctx: SeoModuleContext = {
      title,
      content,
      slug,
      excerpt,
      primaryKeyword: parsed.primaryKeyword,
      category,
      tags,
      featuredImage,
      clusterPath: parsed.clusterPath,
    };

    const seo = runSeoModules(ctx);
    const geo = optimizeGeo({
      title: seo.metadata.seoTitle,
      content: seo.optimizedContent,
      primaryKeyword: parsed.primaryKeyword,
      faqs: seo.faq.faqs,
      canonicalUrl: seo.canonical.canonicalUrl,
      schemaTypes: seo.schema.schemaTypes,
    });

    let applied = false;
    if (parsed.apply && blogId) {
      await applySeoGeoToBlog({
        blogId,
        seo,
        geo,
      });
      applied = true;
    }

    await completeSeoGeoRun({
      runId: run.id,
      seo,
      geo,
      applied,
      blogId,
    });

    return { runId: run.id, blogId, applied, seo, geo };
  } catch (err) {
    const message = err instanceof Error ? err.message : "SEO/GEO failed";
    await failSeoGeoRun(run.id, message);
    throw err;
  }
}

export function createSeoService() {
  return {
    optimize: async (input: SeoOptimizeInput) => {
      const report = await optimizeSeoAndGeo({
        ...input,
        apply: input.apply,
      });
      return report.seo;
    },
    optimizeWithGeo: optimizeSeoAndGeo,
  };
}
