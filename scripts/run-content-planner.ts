/**
 * CLI: npm run ai:plan
 */

import { generateContentPlans } from "../src/ai/planner";

async function main() {
  console.log("[ai:plan] generating content plans…");
  const report = await generateContentPlans({
    opportunityLimit: 40,
    maxClusters: 8,
    maxSupportingPerCluster: 4,
  });
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error("[ai:plan] failed:", error);
  process.exit(1);
});
