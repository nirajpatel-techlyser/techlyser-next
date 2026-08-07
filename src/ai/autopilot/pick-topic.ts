import { prisma } from "@/lib/prisma";
import type { AutopilotTopic } from "./types";
import { DEFAULT_AUDIENCE } from "./config";

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

/**
 * Prefer planner ContentIdeas without a blog; fallback to top Opportunity.
 */
export async function pickNextAutopilotTopic(): Promise<AutopilotTopic | null> {
  const idea = await prisma.contentIdea.findFirst({
    where: {
      blogId: null,
      status: { in: ["QUEUED", "APPROVED", "DRAFT"] },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    include: {
      cluster: { select: { name: true } },
      keyword: { select: { term: true, intent: true } },
    },
  });

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
      audience: DEFAULT_AUDIENCE,
      searchIntent: mapIntent(idea.keyword?.intent || idea.angle),
      category: idea.cluster?.name || "Shopify",
      tone: "premium",
      length: idea.targetWords && idea.targetWords > 2000 ? "long" : "medium",
    };
  }

  const opportunity = await prisma.opportunity.findFirst({
    where: {
      status: { in: ["NEW", "REVIEWED", "QUEUED"] },
      contentIdeaId: null,
    },
    orderBy: [{ opportunityScore: "desc" }, { rank: "asc" }],
  });

  if (!opportunity) return null;

  const keyword = pickKeyword(opportunity.keywords, opportunity.title);
  return {
    source: "opportunity",
    id: opportunity.id,
    keyword,
    title: opportunity.title,
    audience: DEFAULT_AUDIENCE,
    searchIntent: mapIntent(opportunity.intentLabel),
    category: opportunity.category || "Shopify",
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
