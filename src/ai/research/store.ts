import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { NormalizedResearchResult } from "./types";

export type PersistResearchItemsInput = {
  items: NormalizedResearchResult[];
  researchId?: string | null;
  dryRun?: boolean;
};

export type PersistResearchItemsResult = {
  upserted: number;
  skipped: number;
  ids: string[];
};

export async function persistResearchItems(
  input: PersistResearchItemsInput,
): Promise<PersistResearchItemsResult> {
  if (input.dryRun) {
    return { upserted: 0, skipped: input.items.length, ids: [] };
  }

  let upserted = 0;
  let skipped = 0;
  const ids: string[] = [];

  for (const item of input.items) {
    if (!item.url || !item.title) {
      skipped += 1;
      continue;
    }

    try {
      const data: Prisma.ResearchItemUncheckedCreateInput = {
        title: item.title,
        url: item.url,
        category: item.category,
        keywords: item.keywords,
        source: item.source,
        sourceLabel: item.sourceLabel,
        publishedAt: item.publishedAt,
        summary: item.summary,
        relevanceScore: item.relevanceScore,
        status: "NEW",
        raw: item.raw as Prisma.InputJsonValue | undefined,
        researchId: input.researchId || undefined,
      };

      const row = await prisma.researchItem.upsert({
        where: { url: item.url },
        create: data,
        update: {
          title: data.title,
          category: data.category,
          keywords: data.keywords,
          source: data.source,
          sourceLabel: data.sourceLabel,
          publishedAt: data.publishedAt,
          summary: data.summary,
          relevanceScore: data.relevanceScore,
          raw: data.raw,
          ...(input.researchId ? { researchId: input.researchId } : {}),
        },
        select: { id: true },
      });

      ids.push(row.id);
      upserted += 1;
    } catch (error) {
      console.error("[research.store] upsert failed:", item.url, error);
      skipped += 1;
    }
  }

  return { upserted, skipped, ids };
}

export async function createResearchRun(input: {
  title: string;
  query?: string;
  sources: string[];
}) {
  return prisma.research.create({
    data: {
      title: input.title,
      status: "RUNNING",
      summary: input.query
        ? `Market research for query: ${input.query}`
        : "Automated market research run",
      entities: input.sources,
      startedAt: new Date(),
      rawPayload: {
        query: input.query || null,
        sources: input.sources,
      },
    },
  });
}

export async function completeResearchRun(
  researchId: string,
  input: {
    status: "COMPLETED" | "FAILED";
    summary: string;
    sourceUrls: string[];
    errorMessage?: string;
  },
) {
  return prisma.research.update({
    where: { id: researchId },
    data: {
      status: input.status,
      summary: input.summary,
      sourceUrls: input.sourceUrls,
      errorMessage: input.errorMessage,
      completedAt: new Date(),
    },
  });
}

export async function listRecentResearchItems(limit = 50) {
  return prisma.researchItem.findMany({
    orderBy: [{ relevanceScore: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
}
