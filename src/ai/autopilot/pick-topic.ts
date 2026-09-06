import type { AutopilotTopic } from "./types";
import { DEFAULT_TECHLYSER_AUDIENCE, isTechlyserNicheTopic } from "@/ai/brand/niche";
import { prisma } from "@/lib/prisma";

function mapIntent(
  label?: string | null,
): AutopilotTopic["searchIntent"] {
  const v = (label || "").toLowerCase();
  if (v.includes("commercial")) return "commercial";
  if (v.includes("transactional")) return "transactional";
  if (v.includes("navigational")) return "navigational";
  if (v.includes("informational")) return "informational";
  return "informational";
}

function pickKeyword(keywords: string[], title: string) {
  return (
    keywords.find((k) => k.trim().length > 3)?.trim() ||
    title.slice(0, 120).trim()
  );
}

function ideaMatchesNiche(idea: {
  title: string;
  angle: string | null;
  keyword?: { term: string } | null;
  cluster?: { name: string } | null;
  metadata?: unknown;
}): boolean {
  const meta = idea.metadata as { keywords?: string[] } | null;
  return isTechlyserNicheTopic(
    idea.title,
    idea.angle,
    idea.keyword?.term,
    idea.cluster?.name,
    ...(meta?.keywords || []),
  );
}

/**
 * Prefer planner ContentIdeas without a blog; fallback to top Opportunity.
 * Hard-filters to Shopify / ecommerce growth niche (never GitHub product dumps).
 */
export async function pickNextAutopilotTopic(): Promise<AutopilotTopic | null> {
  const ideas = await prisma.contentIdea.findMany({
    where: {
      blogId: null,
      status: { in: ["QUEUED", "APPROVED", "DRAFT"] },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    take: 40,
    include: {
      cluster: { select: { name: true } },
      keyword: { select: { term: true, intent: true } },
    },
  });

  const idea = ideas.find(ideaMatchesNiche);

  if (idea) {
    const keyword =
      idea.keyword?.term ||
      pickKeyword([], idea.title) ||
      idea.title;
    return {
      source: "contentIdea",
      id: idea.id,
      contentIdeaId: idea.id,
      keyword,
      title: idea.title,
      audience: DEFAULT_TECHLYSER_AUDIENCE,
      searchIntent: mapIntent(idea.keyword?.intent || idea.angle),
      category: idea.cluster?.name || "Shopify Growth",
      tone: "premium",
      length: idea.targetWords && idea.targetWords > 2000 ? "long" : "medium",
    };
  }

  const opportunities = await prisma.opportunity.findMany({
    where: {
      status: { in: ["NEW", "REVIEWED", "QUEUED"] },
      contentIdeaId: null,
    },
    orderBy: [{ opportunityScore: "desc" }, { rank: "asc" }],
    take: 40,
  });

  const opportunity = opportunities.find((row) =>
    isTechlyserNicheTopic(
      row.title,
      row.summary,
      row.category,
      ...(row.keywords || []),
    ),
  );

  if (!opportunity) return null;

  const keyword = pickKeyword(opportunity.keywords, opportunity.title);
  return {
    source: "opportunity",
    id: opportunity.id,
    keyword,
    title: opportunity.title,
    audience: DEFAULT_TECHLYSER_AUDIENCE,
    searchIntent: mapIntent(opportunity.intentLabel),
    category: opportunity.category || "Shopify Growth",
    tone: "premium",
    length: "medium",
  };
}

export async function markTopicUsed(topic: AutopilotTopic, blogId: string) {
  if (topic.source === "contentIdea" && topic.contentIdeaId) {
    await prisma.contentIdea.update({
      where: { id: topic.contentIdeaId },
      data: { blogId, status: "DRAFT" },
    });
  }

  if (topic.source === "opportunity") {
    await prisma.opportunity.update({
      where: { id: topic.id },
      data: { status: "QUEUED" },
    });
  }
}
