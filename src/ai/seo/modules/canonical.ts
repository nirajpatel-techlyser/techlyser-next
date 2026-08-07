import { absoluteUrl, siteConfig } from "@/lib/seo";
import type { SeoCanonicalResult, SeoModuleContext } from "../types";

export function optimizeCanonical(ctx: SeoModuleContext): SeoCanonicalResult {
  const slug = ctx.slug.replace(/^\/+/, "");
  const canonicalPath = `/${slug}`;
  return {
    canonicalPath,
    canonicalUrl: absoluteUrl(canonicalPath),
    hreflang: {
      "en-IN": canonicalPath,
      en: canonicalPath,
      "x-default": canonicalPath,
    },
  };
}

export function brandCanonicalBase() {
  return siteConfig.url;
}
