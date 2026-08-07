#!/usr/bin/env tsx
/**
 * Run the daily autopilot pipeline once (local or CI).
 *
 * Usage:
 *   npm run ai:daily
 *   npm run ai:daily -- --dry-run
 */

import { runDailyAutopilot } from "../src/ai/autopilot";

function hasFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

async function main() {
  const dryRun = hasFlag("dry-run");
  const report = await runDailyAutopilot({ dryRun });

  if (report.skipped) {
    console.log(`\nSkipped: ${report.skipReason || "unknown"}\n`);
    if (report.topic) {
      console.log("Next topic preview:", report.topic.keyword);
    }
    return;
  }

  console.log("\n✓ Daily autopilot complete\n");
  console.log(`  Run ID:    ${report.runId}`);
  console.log(`  Blog ID:   ${report.blogId || "—"}`);
  console.log(`  Slug:      ${report.slug || "—"}`);
  console.log(`  Image:     ${report.featuredImage || "—"}`);
  console.log(`  SEO/GEO:   ${report.seoScore ?? "—"} / ${report.geoScore ?? "—"}`);
  console.log(`  Result:    ${report.steps.done?.detail || "—"}`);
  console.log("");
}

main().catch((err) => {
  console.error("[ai:daily]", err);
  process.exit(1);
});
