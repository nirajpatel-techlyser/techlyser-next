import { absoluteUrl, siteConfig } from "@/lib/seo";
import type {
  SeoModuleContext,
  SeoOpenGraphResult,
  SeoTwitterResult,
} from "../types";
import type { SeoMetadataResult, SeoCanonicalResult } from "../types";

export function optimizeOpenGraph(input: {
  ctx: SeoModuleContext;
  metadata: SeoMetadataResult;
  canonical: SeoCanonicalResult;
}): SeoOpenGraphResult {
  const image = absoluteUrl(
    input.ctx.featuredImage || siteConfig.defaultOgImage,
  );
  return {
    type: "article",
    title: input.metadata.seoTitle,
    description: input.metadata.seoDescription,
    url: input.canonical.canonicalUrl,
    image,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
  };
}

export function optimizeTwitter(input: {
  metadata: SeoMetadataResult;
  openGraph: SeoOpenGraphResult;
}): SeoTwitterResult {
  return {
    card: "summary_large_image",
    title: input.metadata.seoTitle,
    description: input.metadata.seoDescription,
    image: input.openGraph.image,
  };
}
