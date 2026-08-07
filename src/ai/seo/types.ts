import type { TocItem } from "@/lib/blog-html";

export type SeoInternalLink = {
  anchor: string;
  href: string;
  reason: string;
};

export type SeoFaqItem = {
  question: string;
  answer: string;
};

export type SeoOptimizeInput = {
  blogId?: string;
  title: string;
  content: string;
  slug?: string;
  excerpt?: string | null;
  primaryKeyword: string;
  category?: string | null;
  tags?: string[];
  featuredImage?: string | null;
  clusterPath?: string;
  /** When true, write optimized fields back to Blog (keeps DRAFT status). */
  apply?: boolean;
};

export type SeoMetadataResult = {
  seoTitle: string;
  seoDescription: string;
  metaKeywords: string[];
  issues: string[];
};

export type SeoCanonicalResult = {
  canonicalPath: string;
  canonicalUrl: string;
  hreflang: Record<string, string>;
};

export type SeoHeadingResult = {
  hierarchyValid: boolean;
  issues: string[];
  toc: TocItem[];
  optimizedHtml?: string;
};

export type SeoAltTextResult = {
  imagesWithoutAlt: number;
  imagesFixed: number;
  optimizedHtml?: string;
  issues: string[];
};

export type SeoFaqResult = {
  faqs: SeoFaqItem[];
  faqHtml?: string;
  issues: string[];
};

export type SeoInternalLinksResult = {
  links: SeoInternalLink[];
  suggestedHtmlSnippet: string;
  issues: string[];
};

export type SeoOpenGraphResult = {
  type: "article";
  title: string;
  description: string;
  url: string;
  image: string;
  siteName: string;
  locale: string;
};

export type SeoTwitterResult = {
  card: "summary_large_image";
  title: string;
  description: string;
  image: string;
};

export type SeoSchemaResult = {
  jsonLd: Record<string, unknown>[];
  schemaTypes: string[];
  issues: string[];
};

export type SeoModuleId =
  | "metadata"
  | "canonical"
  | "headings"
  | "altText"
  | "faq"
  | "internalLinks"
  | "openGraph"
  | "twitter"
  | "schema"
  | "jsonLd";

export type SeoOptimizeOutput = {
  score: number;
  modules: SeoModuleId[];
  metadata: SeoMetadataResult;
  canonical: SeoCanonicalResult;
  headings: SeoHeadingResult;
  altText: SeoAltTextResult;
  faq: SeoFaqResult;
  internalLinks: SeoInternalLinksResult;
  openGraph: SeoOpenGraphResult;
  twitter: SeoTwitterResult;
  schema: SeoSchemaResult;
  /** Final HTML after heading + alt fixes (content body only). */
  optimizedContent: string;
  issues: string[];
};

export type SeoModuleContext = {
  title: string;
  content: string;
  slug: string;
  excerpt?: string | null;
  primaryKeyword: string;
  category?: string | null;
  tags: string[];
  featuredImage?: string | null;
  clusterPath?: string;
  publishedAt?: string | null;
};
