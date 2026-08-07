/**
 * SEO Optimizer (Phase 6)
 *
 * Modular on-page SEO: metadata, canonical, headings, alt text, FAQ,
 * internal links, Open Graph, Twitter, schema / JSON-LD.
 * Combine with GEO via optimizeSeoAndGeo(). Never auto-publishes.
 */

export * from "./types";
export * from "./config";
export {
  runSeoModules,
  optimizeSeoAndGeo,
  createSeoService,
  seoOptimizeInputSchema,
  type SeoGeoReport,
} from "./engine";
export {
  listSeoGeoRuns,
  getSeoGeoRun,
  listBlogsForSeo,
  loadBlogForSeo,
} from "./store";
export * as seoModules from "./modules";
