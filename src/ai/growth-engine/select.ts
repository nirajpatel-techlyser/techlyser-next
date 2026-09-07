import type { AutopilotTopic } from "@/ai/autopilot/types";
import { DEFAULT_TECHLYSER_AUDIENCE } from "@/ai/brand/niche";
import { buildTopicPool } from "./pool";
import { scoreGrowthCandidate } from "./score";
import type {
  GrowthCandidate,
  GrowthDecision,
  GrowthSelectResult,
} from "./types";

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

function candidateToTopic(candidate: GrowthCandidate): AutopilotTopic {
  return {
    source: candidate.source,
    id: candidate.id,
    contentIdeaId: candidate.contentIdeaId,
    keyword: candidate.keyword,
    title: candidate.title,
    audience: DEFAULT_TECHLYSER_AUDIENCE,
    searchIntent: mapIntent(candidate.intentLabel),
    category: candidate.category || "Shopify Growth",
    tone: "premium",
    length:
      candidate.targetWords && candidate.targetWords > 2000 ? "long" : "medium",
  };
}

/**
 * Rank topic pool through Growth Engine stages and pick the best accepted topic.
 *
 * Pipeline: Topic Pool → Relevance → Third-Party → SEO Opportunity → Lead Potential → Selection
 */
export async function selectGrowthTopic(): Promise<{
  topic: AutopilotTopic;
  result: GrowthSelectResult;
} | null> {
  const pool = await buildTopicPool();
  if (pool.length === 0) return null;

  const decisions: GrowthDecision[] = pool.map(scoreGrowthCandidate);
  const accepted = decisions
    .filter((d) => d.accepted)
    .sort((a, b) => b.growthScore - a.growthScore);
  const rejected = decisions.filter((d) => !d.accepted);

  if (accepted.length === 0) {
    return null;
  }

  const best = accepted[0];
  const candidate = pool.find((c) => c.id === best.candidateId);
  if (!candidate) return null;

  const result: GrowthSelectResult = {
    decision: best,
    ranked: accepted,
    rejected,
  };

  return {
    topic: candidateToTopic(candidate),
    result,
  };
}

/** Dry-run / admin: return ranked decisions without picking for write. */
export async function rankGrowthTopics(): Promise<GrowthSelectResult | null> {
  const pool = await buildTopicPool();
  if (pool.length === 0) return null;

  const decisions = pool.map(scoreGrowthCandidate);
  const accepted = decisions
    .filter((d) => d.accepted)
    .sort((a, b) => b.growthScore - a.growthScore);
  const rejected = decisions.filter((d) => !d.accepted);

  if (accepted.length === 0) {
    return {
      decision: rejected[0] || {
        candidateId: "",
        source: "contentIdea",
        title: "",
        keyword: "",
        scores: {
          relevance: 0,
          thirdPartyPass: false,
          thirdPartyNote: "empty",
          seoOpportunity: 0,
          leadPotential: 0,
          priorityNorm: 0,
        },
        growthScore: 0,
        accepted: false,
        rejectReason: "No candidates",
        rankedAt: new Date().toISOString(),
      },
      ranked: [],
      rejected,
    };
  }

  return {
    decision: accepted[0],
    ranked: accepted,
    rejected,
  };
}
