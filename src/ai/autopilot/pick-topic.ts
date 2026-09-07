import type { AutopilotTopic } from "./types";
import { selectGrowthTopic } from "@/ai/growth-engine";
import { prisma } from "@/lib/prisma";

/**
 * Pick next topic via Techlyser Growth Engine:
 * Topic Pool → Relevance → Third-Party → SEO Opportunity → Lead Potential → Selection
 */
export async function pickNextAutopilotTopic(): Promise<AutopilotTopic | null> {
  const selected = await selectGrowthTopic();
  return selected?.topic ?? null;
}

/**
 * Same as pickNextAutopilotTopic but also returns Growth Engine decision scores
 * for autopilot reporting / dry-run.
 */
export async function pickNextAutopilotTopicWithDecision() {
  return selectGrowthTopic();
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
