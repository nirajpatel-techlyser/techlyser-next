import type { AutopilotTopic } from "@/ai/autopilot/types";
import { TARGET_AUDIENCE_PROFILE } from "@/ai/brand/positioning";
import { detectContentPillars } from "@/ai/brand/positioning";
import { prisma } from "@/lib/prisma";
import { GROWTH_THRESHOLDS } from "./config";
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

function tokenOverlap(a: string, b: string): number {
  const ta = new Set(
    a
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2),
  );
  const tb = new Set(
    b
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2),
  );
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  return inter / Math.min(ta.size, tb.size);
}

async function isDuplicateOfRecent(title: string): Promise<boolean> {
  const recent = await prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
    take: GROWTH_THRESHOLDS.recentBlogLookback,
    select: { title: true },
  });
  return recent.some(
    (b) =>
      tokenOverlap(title, b.title) >= GROWTH_THRESHOLDS.maxTitleOverlapWithRecent,
  );
}

function candidateToTopic(candidate: GrowthCandidate): AutopilotTopic {
  const pillars = detectContentPillars(
    candidate.title,
    candidate.summary,
    candidate.keyword,
  );
  const category =
    candidate.category && candidate.category !== "Shopify Growth"
      ? candidate.category
      : pillars[0]
        ? pillars[0].replace(/-/g, " ")
        : "Web Development";

  return {
    source: candidate.source,
    id: candidate.id,
    contentIdeaId: candidate.contentIdeaId,
    keyword: candidate.keyword,
    title: candidate.title,
    audience: TARGET_AUDIENCE_PROFILE,
    searchIntent: mapIntent(candidate.intentLabel),
    category,
    tone: "premium",
    length:
      candidate.targetWords && candidate.targetWords > 2000 ? "long" : "medium",
  };
}

async function rankPool(
  pool: GrowthCandidate[],
): Promise<{ accepted: GrowthDecision[]; rejected: GrowthDecision[] }> {
  const decisions: GrowthDecision[] = [];
  for (const candidate of pool) {
    const decision = scoreGrowthCandidate(candidate);
    if (decision.accepted && (await isDuplicateOfRecent(candidate.title))) {
      decision.accepted = false;
      decision.rejectReason = "Duplicate / overlaps a recent blog topic";
    }
    decisions.push(decision);
  }

  const accepted = decisions
    .filter((d) => d.accepted)
    .sort((a, b) => b.techlyserGrowthScore - a.techlyserGrowthScore);
  const rejected = decisions.filter((d) => !d.accepted);
  return { accepted, rejected };
}

/**
 * Rank topic pool and pick highest techlyserGrowthScore (>= 70).
 */
export async function selectGrowthTopic(): Promise<{
  topic: AutopilotTopic;
  result: GrowthSelectResult;
} | null> {
  const pool = await buildTopicPool();
  if (pool.length === 0) return null;

  const { accepted, rejected } = await rankPool(pool);
  if (accepted.length === 0) return null;

  const best = accepted[0];
  const candidate = pool.find((c) => c.id === best.candidateId);
  if (!candidate) return null;

  return {
    topic: candidateToTopic(candidate),
    result: { decision: best, ranked: accepted, rejected },
  };
}

export async function rankGrowthTopics(): Promise<GrowthSelectResult | null> {
  const pool = await buildTopicPool();
  if (pool.length === 0) return null;

  const { accepted, rejected } = await rankPool(pool);
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
          techlyserGrowthScore: 0,
        },
        growthScore: 0,
        techlyserGrowthScore: 0,
        accepted: false,
        rejectReason: "No candidates scored >= 70",
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
