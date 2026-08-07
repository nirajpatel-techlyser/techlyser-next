import type { Opportunity } from "@prisma/client";
import { slugifyAiKey } from "../utils";
import { suggestArticlePath, suggestClusterSlug } from "./config";
import type { PlannedDraftItem } from "./types";

export type OpportunityClusterGroup = {
  key: string;
  name: string;
  slug: string;
  description: string;
  items: PlannedDraftItem[];
};

function clusterKeyFor(opportunity: Opportunity): string {
  const category = (opportunity.category || "general").toLowerCase();
  const primaryKw = opportunity.keywords[0]?.toLowerCase();
  if (primaryKw && primaryKw.length > 2) {
    return slugifyAiKey(`${category}-${primaryKw}`);
  }
  // Fallback: first meaningful title token set
  const tokens = opportunity.title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3)
    .slice(0, 2)
    .join("-");
  return slugifyAiKey(`${category}-${tokens || "topic"}`);
}

function clusterNameFor(opportunity: Opportunity): string {
  const category = opportunity.category || "Growth";
  const kw = opportunity.keywords[0];
  if (kw) return `${category}: ${kw}`;
  return `${category} cluster`;
}

function toDraftItem(opportunity: Opportunity): PlannedDraftItem {
  const title = opportunity.title.replace(/\s+/g, " ").trim();
  return {
    role: "SUPPORTING",
    title,
    slugSuggestion: slugifyAiKey(title).slice(0, 100),
    angle:
      opportunity.summary ||
      opportunity.rationale ||
      `Cover “${title}” with Techlyser proof, FAQs, and clear CTAs.`,
    suggestedPath: suggestArticlePath(title),
    opportunityId: opportunity.id,
    clusterKey: clusterKeyFor(opportunity),
    score: opportunity.opportunityScore,
    keywords: opportunity.keywords,
    category: opportunity.category,
  };
}

/**
 * Group opportunities into topic clusters.
 * Highest-scoring item in each group becomes the pillar.
 */
export function buildTopicClusters(
  opportunities: Opportunity[],
  options: { maxClusters?: number; maxSupportingPerCluster?: number } = {},
): OpportunityClusterGroup[] {
  const maxClusters = options.maxClusters ?? 8;
  const maxSupporting = options.maxSupportingPerCluster ?? 4;

  const buckets = new Map<string, PlannedDraftItem[]>();
  for (const opportunity of opportunities) {
    const item = toDraftItem(opportunity);
    const list = buckets.get(item.clusterKey) || [];
    list.push(item);
    buckets.set(item.clusterKey, list);
  }

  const groups: OpportunityClusterGroup[] = [];

  for (const [key, items] of buckets) {
    items.sort((a, b) => b.score - a.score);
    const pillar = { ...items[0], role: "PILLAR" as const };
    const supporting = items.slice(1, 1 + maxSupporting).map((item) => ({
      ...item,
      role: "SUPPORTING" as const,
    }));

    const seed = opportunities.find((o) => o.id === pillar.opportunityId);
    const name = seed ? clusterNameFor(seed) : key;
    groups.push({
      key,
      name,
      slug: suggestClusterSlug(name),
      description: `Pillar + supporting articles for ${name}. Derived from ranked opportunities.`,
      items: [pillar, ...supporting],
    });
  }

  groups.sort((a, b) => (b.items[0]?.score || 0) - (a.items[0]?.score || 0));
  return groups.slice(0, maxClusters);
}
