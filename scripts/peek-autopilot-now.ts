import { PrismaClient } from "@prisma/client";
import { selectGrowthTopic } from "../src/ai/growth-engine";

async function main() {
  const p = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
  const since = new Date("2026-10-27T00:00:00.000Z");
  const runs = await p.aiAgentRun.findMany({
    where: { workflowId: "daily-autopilot", createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      createdAt: true,
      status: true,
      currentStep: true,
      errorMessage: true,
      output: true,
      startedAt: true,
      completedAt: true,
    },
  });
  console.log("runs", runs.length);
  for (const run of runs) {
    const out = run.output as {
      skipReason?: string;
      slug?: string;
      blogId?: string;
      steps?: Record<string, { ok?: boolean; detail?: string }>;
    } | null;
    console.log(
      [
        run.createdAt.toISOString(),
        run.status,
        run.currentStep || "-",
        out?.slug || "noBlog",
        out?.skipReason || "-",
        (run.errorMessage || "-").slice(0, 140),
      ].join(" | "),
    );
    if (out?.steps) {
      console.log("  steps", JSON.stringify(out.steps));
    }
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayOk = await p.aiAgentRun.findFirst({
    where: {
      workflowId: "daily-autopilot",
      status: "SUCCEEDED",
      createdAt: { gte: today },
    },
    select: { id: true },
  });
  console.log("succeeded_today", Boolean(todayOk));

  const ideas = await p.contentIdea.count({
    where: { blogId: null, status: { in: ["QUEUED", "APPROVED", "DRAFT"] } },
  });
  console.log("queued_ideas", ideas);
  const next = await selectGrowthTopic();
  console.log(
    "next",
    next
      ? {
          title: next.topic.title,
          score: next.result.decision.techlyserGrowthScore,
          accepted: next.result.decision.accepted,
        }
      : null,
  );
  await p.$disconnect();
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : "peek failed");
  process.exit(1);
});
