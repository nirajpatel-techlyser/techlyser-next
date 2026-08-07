#!/usr/bin/env tsx
/**
 * CLI: run SEO + GEO optimization on a Blog.
 *
 * Usage:
 *   npm run ai:seo -- --blog-id <cuid> --keyword "hire shopify developers india"
 *   npm run ai:seo -- --blog-id <cuid> --keyword "..." --apply
 *   npm run ai:seo -- --blog-id <cuid> --keyword "..." --no-apply
 */

import { optimizeSeoAndGeo } from "../src/ai/seo";

function readArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= process.argv.length) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

async function main() {
  const blogId = readArg("blog-id");
  const keyword = readArg("keyword");

  if (!blogId || !keyword) {
    console.error(
      'Usage: npm run ai:seo -- --blog-id <id> --keyword "primary keyword" [--apply|--no-apply]',
    );
    process.exit(1);
  }

  const apply = hasFlag("no-apply") ? false : true;

  const report = await optimizeSeoAndGeo({
    blogId,
    primaryKeyword: keyword,
    apply,
  });

  console.log("\n✓ SEO + GEO complete\n");
  console.log(`  Run ID:     ${report.runId}`);
  console.log(`  Blog ID:    ${report.blogId || "—"}`);
  console.log(`  Applied:    ${report.applied}`);
  console.log(`  SEO score:  ${report.seo.score}`);
  console.log(`  GEO score:  ${report.geo.score}`);
  console.log(`  SEO modules:${report.seo.modules.join(", ")}`);
  console.log(`  GEO modules:${report.geo.modules.join(", ")}`);
  console.log(`  Title:      ${report.seo.metadata.seoTitle}`);
  console.log(`  Canonical:  ${report.seo.canonical.canonicalUrl}`);
  console.log(
    `  Entities:   ${report.geo.entityCoverage.covered}/${report.geo.entityCoverage.total}`,
  );
  console.log(
    `  Engines:    ${report.geo.engines.map((e) => e.engine).join(", ")}`,
  );
  console.log("");
}

main().catch((err) => {
  console.error("[ai:seo]", err);
  process.exit(1);
});
