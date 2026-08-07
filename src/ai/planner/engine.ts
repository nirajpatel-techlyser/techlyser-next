import type { ContentPlanHorizon, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildTopicClusters } from "./cluster";
import {
  addDays,
  distributeDates,
  startOfDay,
} from "./config";
import { buildInternalLinkMap, outboundLinksForItem } from "./link-map";
import type {
  PlannerGenerateOptions,
  PlannerGenerateReport,
} from "./types";

async function archiveDraftPlans(horizons: ContentPlanHorizon[]) {
  await prisma.contentPlan.updateMany({
    where: { status: "DRAFT", horizon: { in: horizons } },
    data: { status: "ARCHIVED" },
  });
}

function uniqueSlug(base: string, used: Set<string>) {
  let slug = base.slice(0, 90) || "idea";
  let i = 2;
  while (used.has(slug)) {
    slug = `${base.slice(0, 80)}-${i}`;
    i += 1;
  }
  used.add(slug);
  return slug;
}

/**
 * Convert ranked opportunities into clusters, ideas, and daily/weekly/monthly plans.
 * Does not write article bodies.
 */
export async function generateContentPlans(
  options: PlannerGenerateOptions = {},
): Promise<PlannerGenerateReport> {
  const opportunityLimit = options.opportunityLimit ?? 40;
  const maxClusters = options.maxClusters ?? 8;
  const maxSupportingPerCluster = options.maxSupportingPerCluster ?? 4;
  const locale = options.locale ?? "en-IN";
  const archivePreviousDrafts = options.archivePreviousDrafts !== false;

  const opportunities = await prisma.opportunity.findMany({
    where: { status: { in: ["NEW", "REVIEWED", "QUEUED"] } },
    orderBy: [{ opportunityScore: "desc" }, { rank: "asc" }],
    take: opportunityLimit,
  });

  if (opportunities.length === 0) {
    throw new Error(
      "No opportunities found. Run the Opportunity Engine first (npm run ai:opportunities).",
    );
  }

  const clusters = buildTopicClusters(opportunities, {
    maxClusters,
    maxSupportingPerCluster,
  });
  const linkMap = buildInternalLinkMap(clusters);

  if (archivePreviousDrafts) {
    await archiveDraftPlans(["DAILY", "WEEKLY", "MONTHLY"]);
  }

  const usedIdeaSlugs = new Set(
    (
      await prisma.contentIdea.findMany({
        where: { slug: { not: null } },
        select: { slug: true },
      })
    )
      .map((row) => row.slug)
      .filter(Boolean) as string[],
  );

  const clusterIds: string[] = [];
  const ideaIds: string[] = [];
  const flatItems: Array<{
    role: "PILLAR" | "SUPPORTING";
    title: string;
    slugSuggestion: string;
    angle: string;
    suggestedPath: string;
    opportunityId: string;
    clusterId: string;
    contentIdeaId: string;
    score: number;
  }> = [];

  // Persist clusters + ideas first (plans reference them)
  for (const group of clusters) {
    const cluster = await prisma.contentCluster.upsert({
      where: { slug: group.slug },
      create: {
        name: group.name,
        slug: group.slug,
        description: group.description,
        pillarPath: group.items.find((i) => i.role === "PILLAR")?.suggestedPath,
        status: "PLANNED",
        locale,
        metadata: {
          source: "opportunity-planner",
          itemCount: group.items.length,
        },
      },
      update: {
        name: group.name,
        description: group.description,
        pillarPath: group.items.find((i) => i.role === "PILLAR")?.suggestedPath,
        status: "ACTIVE",
        metadata: {
          source: "opportunity-planner",
          itemCount: group.items.length,
          refreshedAt: new Date().toISOString(),
        },
      },
    });
    clusterIds.push(cluster.id);

    for (const item of group.items) {
      const slug = uniqueSlug(item.slugSuggestion, usedIdeaSlugs);
      const idea = await prisma.contentIdea.create({
        data: {
          title: item.title,
          slug,
          angle: item.angle,
          status: "DRAFT",
          priority: Math.round(item.score * 100),
          clusterId: cluster.id,
          keywordId: undefined,
          metadata: {
            role: item.role,
            opportunityId: item.opportunityId,
            suggestedPath: item.suggestedPath,
            keywords: item.keywords,
          },
        },
      });
      ideaIds.push(idea.id);

      await prisma.opportunity.update({
        where: { id: item.opportunityId },
        data: {
          contentIdeaId: idea.id,
          status: "QUEUED",
        },
      });

      flatItems.push({
        role: item.role,
        title: item.title,
        slugSuggestion: slug,
        angle: item.angle,
        suggestedPath: item.suggestedPath,
        opportunityId: item.opportunityId,
        clusterId: cluster.id,
        contentIdeaId: idea.id,
        score: item.score,
      });
    }
  }

  const today = startOfDay();
  const horizons: Array<{
    horizon: ContentPlanHorizon;
    name: string;
    periodStart: Date;
    periodEnd: Date;
    spanDays: number;
    take: number;
  }> = [
    {
      horizon: "DAILY",
      name: `Daily plan ${today.toISOString().slice(0, 10)}`,
      periodStart: today,
      periodEnd: addDays(today, 1),
      spanDays: 1,
      take: Math.min(3, flatItems.length),
    },
    {
      horizon: "WEEKLY",
      name: `Weekly plan starting ${today.toISOString().slice(0, 10)}`,
      periodStart: today,
      periodEnd: addDays(today, 7),
      spanDays: 7,
      take: Math.min(flatItems.length, Math.max(7, Math.ceil(flatItems.length * 0.6))),
    },
    {
      horizon: "MONTHLY",
      name: `Monthly plan starting ${today.toISOString().slice(0, 10)}`,
      periodStart: today,
      periodEnd: addDays(today, 30),
      spanDays: 30,
      take: flatItems.length,
    },
  ];

  const planIds = {} as Record<ContentPlanHorizon, string>;
  let itemCount = 0;

  const sorted = [...flatItems].sort((a, b) => b.score - a.score);

  for (const horizon of horizons) {
    const selected = sorted.slice(0, horizon.take);
    const dates = distributeDates(
      selected.length,
      horizon.periodStart,
      horizon.spanDays,
    );

    const plan = await prisma.contentPlan.create({
      data: {
        name: horizon.name,
        horizon: horizon.horizon,
        status: "DRAFT",
        periodStart: horizon.periodStart,
        periodEnd: horizon.periodEnd,
        summary: `Auto-generated ${horizon.horizon.toLowerCase()} plan from ${selected.length} opportunity-backed items across ${clusterIds.length} clusters.`,
        linkMap: linkMap as unknown as Prisma.InputJsonValue,
        metadata: {
          opportunityLimit,
          clusterCount: clusterIds.length,
          generatedAt: new Date().toISOString(),
        },
      },
    });
    planIds[horizon.horizon] = plan.id;

    if (horizon.horizon === "MONTHLY") {
      await prisma.contentCluster.updateMany({
        where: { id: { in: clusterIds } },
        data: { planId: plan.id },
      });
    }

    for (let i = 0; i < selected.length; i += 1) {
      const item = selected[i];
      await prisma.contentPlanItem.create({
        data: {
          planId: plan.id,
          role: item.role,
          title: item.title,
          slugSuggestion: item.slugSuggestion,
          angle: item.angle,
          suggestedPath: item.suggestedPath,
          scheduledFor: dates[i] || horizon.periodStart,
          sortOrder: i,
          status: "PLANNED",
          opportunityId: item.opportunityId,
          contentIdeaId: item.contentIdeaId,
          clusterId: item.clusterId,
          outboundLinks: outboundLinksForItem(
            linkMap,
            item.suggestedPath,
          ) as unknown as Prisma.InputJsonValue,
        },
      });
      itemCount += 1;
    }
  }

  return {
    clusterIds,
    planIds,
    ideaIds,
    itemCount,
    linkEdgeCount: linkMap.edges.length,
  };
}

export async function listContentPlans(limit = 30) {
  return prisma.contentPlan.findMany({
    orderBy: [{ createdAt: "desc" }],
    take: limit,
    include: {
      _count: { select: { items: true, clusters: true } },
    },
  });
}

export async function getContentPlanById(id: string) {
  return prisma.contentPlan.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: [{ sortOrder: "asc" }],
        include: {
          cluster: true,
          opportunity: true,
          contentIdea: true,
        },
      },
      clusters: true,
    },
  });
}

export async function listPlannerClusters(limit = 50) {
  return prisma.contentCluster.findMany({
    orderBy: [{ updatedAt: "desc" }],
    take: limit,
    include: {
      _count: { select: { ideas: true, planItems: true } },
      plan: { select: { id: true, name: true, horizon: true } },
    },
  });
}

export async function activateContentPlan(id: string) {
  const plan = await prisma.contentPlan.findUnique({ where: { id } });
  if (!plan) throw new Error("Plan not found");

  await prisma.contentPlan.updateMany({
    where: { horizon: plan.horizon, status: "ACTIVE" },
    data: { status: "ARCHIVED" },
  });

  return prisma.contentPlan.update({
    where: { id },
    data: { status: "ACTIVE" },
  });
}
