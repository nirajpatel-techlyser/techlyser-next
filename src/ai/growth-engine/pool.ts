import { prisma } from "@/lib/prisma";
import { GROWTH_THRESHOLDS } from "./config";
import type { GrowthCandidate } from "./types";

function pickKeyword(keywords: string[], title: string) {
  return (
    keywords.find((k) => k.trim().length > 3)?.trim() ||
    title.slice(0, 120).trim()
  );
}

/**
 * Topic Pool: open ContentIdeas + Opportunities (no blog linked yet).
 * Research → pool; scoring happens in select/score stages.
 */
export async function buildTopicPool(): Promise<GrowthCandidate[]> {
  const [ideas, opportunities] = await Promise.all([
    prisma.contentIdea.findMany({
      where: {
        blogId: null,
        status: { in: ["QUEUED", "APPROVED", "DRAFT"] },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      take: GROWTH_THRESHOLDS.poolLimitIdeas,
      include: {
        cluster: { select: { name: true } },
        keyword: { select: { term: true, intent: true } },
      },
    }),
    prisma.opportunity.findMany({
      where: {
        status: { in: ["NEW", "REVIEWED", "QUEUED"] },
        contentIdeaId: null,
      },
      orderBy: [{ opportunityScore: "desc" }, { rank: "asc" }],
      take: GROWTH_THRESHOLDS.poolLimitOpportunities,
    }),
  ]);

  const fromIdeas: GrowthCandidate[] = ideas.map((idea) => {
    const meta = idea.metadata as {
      keywords?: string[];
    } | null;
    const keywords = meta?.keywords || [];
    const keyword =
      idea.keyword?.term || pickKeyword(keywords, idea.title) || idea.title;

    return {
      source: "contentIdea",
      id: idea.id,
      contentIdeaId: idea.id,
      title: idea.title,
      summary: idea.angle || idea.title,
      keyword,
      keywords,
      category: idea.cluster?.name || "Shopify Growth",
      intentLabel: idea.keyword?.intent || idea.angle,
      priority: idea.priority ?? 0,
      targetWords: idea.targetWords,
    };
  });

  const fromOpps: GrowthCandidate[] = opportunities.map((row) => ({
    source: "opportunity",
    id: row.id,
    title: row.title,
    summary: row.summary || row.title,
    keyword: pickKeyword(row.keywords, row.title),
    keywords: row.keywords || [],
    category: row.category || "Shopify Growth",
    intentLabel: row.intentLabel,
    priority: Math.round((row.opportunityScore || 0) * 100),
    opportunityScore: row.opportunityScore,
    techlyserRelevanceScore: row.techlyserRelevanceScore,
    commercialIntentScore: row.commercialIntentScore,
    keywordGapScore: row.keywordGapScore,
    existingContentScore: row.existingContentScore,
  }));

  // Prefer content ideas slightly by listing them first before equal-score ties
  // are broken in select (ideas already tend to have higher priority seeds).
  return [...fromIdeas, ...fromOpps];
}
