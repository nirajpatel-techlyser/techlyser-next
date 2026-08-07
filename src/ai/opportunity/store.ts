import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ScoredOpportunity } from "./types";

export async function upsertOpportunities(
  scored: ScoredOpportunity[],
  dryRun = false,
): Promise<{ upserted: number; skipped: number; ids: string[] }> {
  if (dryRun) {
    return { upserted: 0, skipped: scored.length, ids: [] };
  }

  let upserted = 0;
  let skipped = 0;
  const ids: string[] = [];

  for (const item of scored) {
    try {
      const data: Prisma.OpportunityUncheckedCreateInput = {
        title: item.title,
        summary: item.summary,
        url: item.url,
        category: item.category,
        keywords: item.keywords,
        intentLabel: item.intentLabel,
        opportunityScore: item.opportunityScore,
        searchIntentScore: item.searchIntentScore,
        commercialIntentScore: item.commercialIntentScore,
        competitionScore: item.competitionScore,
        trendScore: item.trendScore,
        freshnessScore: item.freshnessScore,
        techlyserRelevanceScore: item.techlyserRelevanceScore,
        existingContentScore: item.existingContentScore,
        keywordGapScore: item.keywordGapScore,
        authorityGapScore: item.authorityGapScore,
        rationale: item.rationale,
        factors: item.factors as unknown as Prisma.InputJsonValue,
        status: "NEW",
        researchItemId: item.researchItemId,
        keywordId: item.keywordId || undefined,
      };

      const row = await prisma.opportunity.upsert({
        where: { researchItemId: item.researchItemId },
        create: data,
        update: {
          title: data.title,
          summary: data.summary,
          url: data.url,
          category: data.category,
          keywords: data.keywords,
          intentLabel: data.intentLabel,
          opportunityScore: data.opportunityScore,
          searchIntentScore: data.searchIntentScore,
          commercialIntentScore: data.commercialIntentScore,
          competitionScore: data.competitionScore,
          trendScore: data.trendScore,
          freshnessScore: data.freshnessScore,
          techlyserRelevanceScore: data.techlyserRelevanceScore,
          existingContentScore: data.existingContentScore,
          keywordGapScore: data.keywordGapScore,
          authorityGapScore: data.authorityGapScore,
          rationale: data.rationale,
          factors: data.factors,
        },
        select: { id: true },
      });

      ids.push(row.id);
      upserted += 1;

      // Mark source research as processed when scored
      await prisma.researchItem.update({
        where: { id: item.researchItemId },
        data: { status: "PROCESSED" },
      });
    } catch (error) {
      console.error("[opportunity.store] upsert failed:", item.researchItemId, error);
      skipped += 1;
    }
  }

  return { upserted, skipped, ids };
}

/** Assign dense ranks 1..N by opportunityScore among active statuses. */
export async function rerankOpportunities(): Promise<number> {
  const rows = await prisma.opportunity.findMany({
    where: { status: { in: ["NEW", "REVIEWED", "QUEUED"] } },
    orderBy: [{ opportunityScore: "desc" }, { updatedAt: "desc" }],
    select: { id: true },
  });

  let rank = 1;
  for (const row of rows) {
    await prisma.opportunity.update({
      where: { id: row.id },
      data: { rank },
    });
    rank += 1;
  }

  return rows.length;
}

export async function listTopOpportunities(limit = 25) {
  return prisma.opportunity.findMany({
    where: { status: { in: ["NEW", "REVIEWED", "QUEUED"] } },
    orderBy: [{ opportunityScore: "desc" }, { rank: "asc" }],
    take: limit,
  });
}
