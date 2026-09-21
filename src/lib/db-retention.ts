import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Retention windows aimed at Free-plan DB size + egress. */
export const RETENTION_DAYS = {
  pageViews: 30,
  aiAgentRuns: 21,
  aiWriterRuns: 30,
  aiSeoGeoRuns: 30,
  aiAnalytics: 60,
  researchItemsTerminal: 21,
  researchItemsProcessed: 30,
  researchRuns: 30,
  opportunitiesDismissed: 21,
  contentIdeasRejected: 30,
  heavyJson: 7,
} as const;

export type RetentionReport = {
  dryRun: boolean;
  before: Record<string, number>;
  deleted: Record<string, number>;
  nulled: Record<string, number>;
};

function cutoff(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function countOrZero(fn: () => Promise<number>) {
  try {
    return await fn();
  } catch {
    return 0;
  }
}

/** Snapshot of high-churn table row counts. */
export async function getRetentionCounts() {
  const [
    pageView,
    aiAgentRun,
    aiWriterRun,
    aiSeoGeoRun,
    aiAnalytics,
    researchItem,
    research,
    opportunity,
    contentIdea,
    blog,
  ] = await Promise.all([
    countOrZero(() => prisma.pageView.count()),
    countOrZero(() => prisma.aiAgentRun.count()),
    countOrZero(() => prisma.aiWriterRun.count()),
    countOrZero(() => prisma.aiSeoGeoRun.count()),
    countOrZero(() => prisma.aiAnalytics.count()),
    countOrZero(() => prisma.researchItem.count()),
    countOrZero(() => prisma.research.count()),
    countOrZero(() => prisma.opportunity.count()),
    countOrZero(() => prisma.contentIdea.count()),
    countOrZero(() => prisma.blog.count()),
  ]);

  return {
    pageView,
    aiAgentRun,
    aiWriterRun,
    aiSeoGeoRun,
    aiAnalytics,
    researchItem,
    research,
    opportunity,
    contentIdea,
    blog,
  };
}

/**
 * Delete / trim operational bloat. Never deletes Blog posts.
 * Safe to run repeatedly.
 */
export async function runDbRetention(options: {
  dryRun?: boolean;
}): Promise<RetentionReport> {
  const dryRun = options.dryRun !== false;
  const before = await getRetentionCounts();
  const deleted: Record<string, number> = {};
  const nulled: Record<string, number> = {};

  async function del(
    key: string,
    countFn: () => Promise<number>,
    deleteFn: () => Promise<{ count: number }>,
  ) {
    if (dryRun) {
      deleted[key] = await countFn();
      return;
    }
    const result = await deleteFn();
    deleted[key] = result.count;
  }

  await del(
    "pageView",
    () =>
      prisma.pageView.count({
        where: { createdAt: { lt: cutoff(RETENTION_DAYS.pageViews) } },
      }),
    () =>
      prisma.pageView.deleteMany({
        where: { createdAt: { lt: cutoff(RETENTION_DAYS.pageViews) } },
      }),
  );

  await del(
    "aiAgentRun",
    () =>
      prisma.aiAgentRun.count({
        where: { createdAt: { lt: cutoff(RETENTION_DAYS.aiAgentRuns) } },
      }),
    () =>
      prisma.aiAgentRun.deleteMany({
        where: { createdAt: { lt: cutoff(RETENTION_DAYS.aiAgentRuns) } },
      }),
  );

  await del(
    "aiWriterRun",
    () =>
      prisma.aiWriterRun.count({
        where: {
          createdAt: { lt: cutoff(RETENTION_DAYS.aiWriterRuns) },
          status: { in: ["COMPLETED", "FAILED"] },
        },
      }),
    () =>
      prisma.aiWriterRun.deleteMany({
        where: {
          createdAt: { lt: cutoff(RETENTION_DAYS.aiWriterRuns) },
          status: { in: ["COMPLETED", "FAILED"] },
        },
      }),
  );

  await del(
    "aiSeoGeoRun",
    () =>
      prisma.aiSeoGeoRun.count({
        where: {
          createdAt: { lt: cutoff(RETENTION_DAYS.aiSeoGeoRuns) },
          status: { in: ["COMPLETED", "FAILED"] },
        },
      }),
    () =>
      prisma.aiSeoGeoRun.deleteMany({
        where: {
          createdAt: { lt: cutoff(RETENTION_DAYS.aiSeoGeoRuns) },
          status: { in: ["COMPLETED", "FAILED"] },
        },
      }),
  );

  await del(
    "aiAnalytics",
    () =>
      prisma.aiAnalytics.count({
        where: { recordedAt: { lt: cutoff(RETENTION_DAYS.aiAnalytics) } },
      }),
    () =>
      prisma.aiAnalytics.deleteMany({
        where: { recordedAt: { lt: cutoff(RETENTION_DAYS.aiAnalytics) } },
      }),
  );

  // Opportunities first (FK to ResearchItem)
  await del(
    "opportunityDismissed",
    () =>
      prisma.opportunity.count({
        where: {
          updatedAt: { lt: cutoff(RETENTION_DAYS.opportunitiesDismissed) },
          status: "DISMISSED",
        },
      }),
    () =>
      prisma.opportunity.deleteMany({
        where: {
          updatedAt: { lt: cutoff(RETENTION_DAYS.opportunitiesDismissed) },
          status: "DISMISSED",
        },
      }),
  );

  await del(
    "researchItemTerminal",
    () =>
      prisma.researchItem.count({
        where: {
          createdAt: { lt: cutoff(RETENTION_DAYS.researchItemsTerminal) },
          status: { in: ["ARCHIVED", "IGNORED"] },
        },
      }),
    () =>
      prisma.researchItem.deleteMany({
        where: {
          createdAt: { lt: cutoff(RETENTION_DAYS.researchItemsTerminal) },
          status: { in: ["ARCHIVED", "IGNORED"] },
        },
      }),
  );

  await del(
    "researchItemProcessed",
    () =>
      prisma.researchItem.count({
        where: {
          createdAt: { lt: cutoff(RETENTION_DAYS.researchItemsProcessed) },
          status: "PROCESSED",
        },
      }),
    () =>
      prisma.researchItem.deleteMany({
        where: {
          createdAt: { lt: cutoff(RETENTION_DAYS.researchItemsProcessed) },
          status: "PROCESSED",
        },
      }),
  );

  await del(
    "contentIdeaRejected",
    () =>
      prisma.contentIdea.count({
        where: {
          updatedAt: { lt: cutoff(RETENTION_DAYS.contentIdeasRejected) },
          status: "REJECTED",
        },
      }),
    () =>
      prisma.contentIdea.deleteMany({
        where: {
          updatedAt: { lt: cutoff(RETENTION_DAYS.contentIdeasRejected) },
          status: "REJECTED",
        },
      }),
  );

  await del(
    "researchRun",
    () =>
      prisma.research.count({
        where: {
          createdAt: { lt: cutoff(RETENTION_DAYS.researchRuns) },
          status: { in: ["COMPLETED", "FAILED"] },
        },
      }),
    () =>
      prisma.research.deleteMany({
        where: {
          createdAt: { lt: cutoff(RETENTION_DAYS.researchRuns) },
          status: { in: ["COMPLETED", "FAILED"] },
        },
      }),
  );

  const jsonCutoff = cutoff(RETENTION_DAYS.heavyJson);

  if (dryRun) {
    nulled.researchItemRaw = await prisma.researchItem.count({
      where: { createdAt: { lt: jsonCutoff }, status: "PROCESSED" },
    });
    nulled.researchRawPayload = await prisma.research.count({
      where: {
        createdAt: { lt: jsonCutoff },
        status: { in: ["COMPLETED", "FAILED"] },
      },
    });
    nulled.aiAgentRunPayloads = await prisma.aiAgentRun.count({
      where: { createdAt: { lt: jsonCutoff } },
    });
    nulled.opportunityFactors = await prisma.opportunity.count({
      where: {
        updatedAt: { lt: jsonCutoff },
        status: { in: ["DISMISSED", "CONVERTED", "REVIEWED"] },
      },
    });
  } else {
    nulled.researchItemRaw = (
      await prisma.researchItem.updateMany({
        where: { createdAt: { lt: jsonCutoff }, status: "PROCESSED" },
        data: { raw: Prisma.DbNull },
      })
    ).count;

    nulled.researchRawPayload = (
      await prisma.research.updateMany({
        where: {
          createdAt: { lt: jsonCutoff },
          status: { in: ["COMPLETED", "FAILED"] },
        },
        data: { rawPayload: Prisma.DbNull },
      })
    ).count;

    nulled.aiAgentRunPayloads = (
      await prisma.aiAgentRun.updateMany({
        where: { createdAt: { lt: jsonCutoff } },
        data: { input: Prisma.DbNull, output: Prisma.DbNull },
      })
    ).count;

    nulled.opportunityFactors = (
      await prisma.opportunity.updateMany({
        where: {
          updatedAt: { lt: jsonCutoff },
          status: { in: ["DISMISSED", "CONVERTED", "REVIEWED"] },
        },
        data: { factors: Prisma.DbNull, rationale: null },
      })
    ).count;
  }

  return { dryRun, before, deleted, nulled };
}
