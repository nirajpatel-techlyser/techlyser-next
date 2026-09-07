import { rankGrowthTopics } from "../src/ai/growth-engine";

async function main() {
  const result = await rankGrowthTopics();
  if (!result) {
    console.log(JSON.stringify({ ok: false, reason: "empty pool" }));
    return;
  }
  console.log(
    JSON.stringify(
      {
        best: {
          title: result.decision.title,
          techlyserGrowthScore: result.decision.techlyserGrowthScore,
          accepted: result.decision.accepted,
          rejectReason: result.decision.rejectReason,
          scores: {
            relevance: result.decision.scores.relevance,
            thirdPartyPass: result.decision.scores.thirdPartyPass,
            breakdown: result.decision.scores.growthBreakdown,
          },
        },
        top5: result.ranked.slice(0, 5).map((d) => ({
          title: d.title,
          score: d.techlyserGrowthScore,
        })),
        acceptedCount: result.ranked.length,
        rejectedCount: result.rejected.length,
        rejectedSample: result.rejected.slice(0, 5).map((d) => ({
          title: d.title,
          score: d.techlyserGrowthScore,
          reason: d.rejectReason,
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
