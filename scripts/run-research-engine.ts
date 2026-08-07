/**
 * CLI entry: npm run ai:research
 *
 * Examples:
 *   npm run ai:research
 *   npm run ai:research -- --query=shopify --limit=8
 *   npm run ai:research -- --sources=shopify-blog,hacker-news --dry-run
 */

import { runMarketResearch, listResearchSourceIds } from "../src/ai/research";
import type { ResearchSourceId } from "../src/ai/research";

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function main() {
  const query = readArg("query");
  const limit = Number(readArg("limit") || "10");
  const sourcesArg = readArg("sources");
  const sources = sourcesArg
    ? (sourcesArg.split(",").map((s) => s.trim()) as ResearchSourceId[])
    : undefined;
  const dryRun = hasFlag("dry-run");

  if (hasFlag("list-sources")) {
    console.log(listResearchSourceIds().join("\n"));
    return;
  }

  console.log("[ai:research] starting market research…");
  const report = await runMarketResearch({
    query,
    limitPerSource: Number.isFinite(limit) ? limit : 10,
    sources,
    dryRun,
    locale: "en-IN",
  });

  console.log(
    JSON.stringify(
      {
        researchId: report.researchId,
        collected: report.collected,
        upserted: report.upserted,
        skipped: report.skipped,
        bySource: report.bySource,
        top: report.items.slice(0, 10).map((item) => ({
          title: item.title,
          url: item.url,
          source: item.source,
          score: item.relevanceScore,
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("[ai:research] failed:", error);
  process.exit(1);
});
