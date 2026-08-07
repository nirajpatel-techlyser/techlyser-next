#!/usr/bin/env tsx
/**
 * CLI: generate an AI article draft and save to Blog CMS as DRAFT.
 *
 * Usage:
 *   npm run ai:write -- --keyword "hire shopify developers india"
 *   npm run ai:write -- --keyword "..." --audience "..." --intent commercial --length long
 */

import { generateArticleDraft } from "../src/ai/writer";
import type {
  WriterLength,
  WriterSearchIntent,
  WriterTone,
} from "../src/ai/writer/types";

function readArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

async function main() {
  const keyword = readArg("keyword");
  if (!keyword) {
    console.error(
      "Usage: npm run ai:write -- --keyword \"your keyword\" [--audience \"...\"] [--intent informational] [--category Shopify] [--tone premium] [--length medium] [--idea-id cuid]",
    );
    process.exit(1);
  }

  const report = await generateArticleDraft({
    keyword,
    audience:
      readArg("audience") ||
      "ecommerce founders, CTOs, and marketing leaders in India",
    searchIntent: (readArg("intent") ||
      "informational") as WriterSearchIntent,
    category: readArg("category") || "Shopify",
    tone: (readArg("tone") || "premium") as WriterTone,
    length: (readArg("length") || "medium") as WriterLength,
    contentIdeaId: readArg("idea-id"),
  });

  console.log("\n✓ Draft saved (BlogStatus.DRAFT — not published)\n");
  console.log(`  Run ID:        ${report.runId}`);
  console.log(`  Blog ID:       ${report.blogId}`);
  console.log(`  Slug:          ${report.slug}`);
  console.log(`  SEO title:     ${report.seoTitle}`);
  console.log(`  Reading time:  ${report.readingTimeMinutes} min`);
  console.log(`  FAQs:          ${report.output.faqs.length}`);
  console.log(`  Schema types:  ${report.output.schema.map((s) => (s as { "@type"?: string })["@type"]).join(", ")}`);
  console.log(`\n  Edit: /admin/blogs/${report.blogId}/edit\n`);
}

main().catch((err) => {
  console.error("[ai:write]", err);
  process.exit(1);
});
