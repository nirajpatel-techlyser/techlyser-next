import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  howToJsonLd,
  siteConfig,
} from "@/lib/seo";
import type { WriterFaq, WriterHowTo, WriterOutput } from "../types";

export function buildWriterSchema(input: {
  seoTitle: string;
  metaDescription: string;
  slug: string;
  faqs: WriterFaq[];
  howTo?: WriterHowTo;
  wordCount: number;
  readingTimeMinutes: number;
  tags: string[];
}): Record<string, unknown>[] {
  const now = new Date().toISOString();
  const schema: Record<string, unknown>[] = [
    blogPostingJsonLd({
      title: input.seoTitle,
      description: input.metaDescription,
      slug: input.slug,
      datePublished: now,
      dateModified: now,
      author: siteConfig.name,
      keywords: [input.seoTitle, ...input.tags],
      wordCount: input.wordCount,
      readingTimeMinutes: input.readingTimeMinutes,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: input.seoTitle, path: `/${input.slug}` },
    ]),
  ];

  if (input.faqs.length > 0) {
    schema.push(faqPageJsonLd(input.faqs));
  }

  if (input.howTo?.steps?.length) {
    schema.push(
      howToJsonLd({
        name: input.howTo.name,
        description: input.howTo.description,
        steps: input.howTo.steps,
      }),
    );
  }

  return schema;
}

export function schemaFromOutput(output: WriterOutput): Record<string, unknown>[] {
  return buildWriterSchema({
    seoTitle: output.seoTitle,
    metaDescription: output.metaDescription,
    slug: output.slug,
    faqs: output.faqs,
    howTo: output.howTo,
    wordCount: output.wordCount,
    readingTimeMinutes: output.readingTimeMinutes,
    tags: output.tags,
  });
}
