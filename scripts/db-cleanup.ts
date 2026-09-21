#!/usr/bin/env tsx
/**
 * Report + clean high-churn Supabase/Postgres tables for Free-plan limits.
 *
 * Usage:
 *   npm run db:cleanup           # dry-run (counts only)
 *   npm run db:cleanup -- --execute
 *   npm run db:cleanup -- --sizes
 */

import { prisma } from "../src/lib/prisma";
import {
  RETENTION_DAYS,
  getRetentionCounts,
  runDbRetention,
} from "../src/lib/db-retention";

function hasFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

async function printTableSizes() {
  console.log("\nTable sizes (approx):\n");
  try {
    const rows = await prisma.$queryRaw<
      { table: string; size: string; bytes: bigint }[]
    >`
      SELECT
        c.relname AS table,
        pg_size_pretty(pg_total_relation_size(c.oid)) AS size,
        pg_total_relation_size(c.oid) AS bytes
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
      ORDER BY pg_total_relation_size(c.oid) DESC
      LIMIT 25
    `;
    for (const row of rows) {
      console.log(`  ${String(row.table).padEnd(28)} ${row.size}`);
    }
  } catch (error) {
    console.error("  Could not read pg sizes:", error);
  }

  try {
    const db = await prisma.$queryRaw<{ size: string }[]>`
      SELECT pg_size_pretty(pg_database_size(current_database())) AS size
    `;
    console.log(`\n  Database total: ${db[0]?.size ?? "?"}`);
  } catch {
    /* ignore */
  }
}

async function main() {
  const execute = hasFlag("execute");
  const sizes = hasFlag("sizes") || !execute;

  console.log("\n=== Techlyser DB cleanup ===");
  console.log(`Mode: ${execute ? "EXECUTE (writes)" : "DRY-RUN"}`);
  console.log("Retention days:", RETENTION_DAYS);
  console.log("Never deletes Blog posts.\n");

  if (sizes) {
    await printTableSizes();
  }

  const before = await getRetentionCounts();
  console.log("\nRow counts (before):");
  for (const [k, v] of Object.entries(before)) {
    console.log(`  ${k.padEnd(18)} ${v}`);
  }

  const report = await runDbRetention({ dryRun: !execute });

  console.log(`\n${execute ? "Deleted" : "Would delete"}:`);
  for (const [k, v] of Object.entries(report.deleted)) {
    console.log(`  ${k.padEnd(24)} ${v}`);
  }

  console.log(`\n${execute ? "Nulled heavy JSON on" : "Would null heavy JSON on"}:`);
  for (const [k, v] of Object.entries(report.nulled)) {
    console.log(`  ${k.padEnd(24)} ${v}`);
  }

  if (execute) {
    const after = await getRetentionCounts();
    console.log("\nRow counts (after):");
    for (const [k, v] of Object.entries(after)) {
      console.log(`  ${k.padEnd(18)} ${v}`);
    }
    await printTableSizes();
    console.log(
      "\nTip: In Supabase SQL editor run: VACUUM (ANALYZE);\n" +
        "That reclaims disk after large deletes on Free plan.",
    );
  } else {
    console.log("\nRe-run with --execute to apply deletes.");
  }
}

main()
  .catch((err) => {
    console.error("[db:cleanup]", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
