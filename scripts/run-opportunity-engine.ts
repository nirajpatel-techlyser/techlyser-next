/**
 * CLI: npm run ai:opportunities
 *
 * Examples:
 *   npm run ai:opportunities
 *   npm run ai:opportunities -- --limit=50
 *   npm run ai:opportunities -- --min-relevance=0.3 --dry-run
 */

import { runOpportunityEngine } from "../src/ai/opportunity";

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function main() {
  const limit = Number(readArg("limit") || "100");
  const minRelevance = Number(readArg("min-relevance") || "0");
  const dryRun = hasFlag("dry-run");

  console.log("[ai:opportunities] scoring research…");
  const report = await runOpportunityEngine({
    limit: Number.isFinite(limit) ? limit : 100,
    minResearchRelevance: Number.isFinite(minRelevance) ? minRelevance : 0,
    dryRun,
  });

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error("[ai:opportunities] failed:", error);
  process.exit(1);
});
