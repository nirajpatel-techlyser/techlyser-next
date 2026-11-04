/**
 * Write-first autopilot draft for today (no market research).
 * Usage: npx tsx --env-file=.env.local scripts/run-today-draft.ts
 */
import { runDailyAutopilot } from "../src/ai/autopilot";

async function main() {
  const report = await runDailyAutopilot({
    oncePerDay: false,
    refreshMarket: false,
    applySeo: true,
  });
  console.log(
    JSON.stringify(
      {
        skipped: report.skipped,
        skipReason: report.skipReason,
        blogId: report.blogId,
        slug: report.slug,
        topic: report.topic?.title,
        steps: report.steps,
      },
      null,
      2,
    ),
  );
  if (report.skipped || !report.blogId) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "draft failed");
  process.exit(1);
});
