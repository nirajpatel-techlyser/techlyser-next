/**
 * AI Content Planner (Phase 4)
 *
 * Converts Opportunities → Topic Clusters → Pillar/Supporting ideas →
 * Daily/Weekly/Monthly ContentPlans + Internal Link Map.
 * No article body generation.
 */

export type {
  InternalLinkMap,
  LinkMapEdge,
  LinkMapNode,
  PlannedDraftItem,
  PlannerGenerateOptions,
  PlannerGenerateReport,
} from "./types";

export { PLANNER_HUBS, suggestArticlePath, suggestClusterSlug } from "./config";
export { buildTopicClusters } from "./cluster";
export { buildInternalLinkMap, outboundLinksForItem } from "./link-map";
export {
  activateContentPlan,
  generateContentPlans,
  getContentPlanById,
  listContentPlans,
  listPlannerClusters,
} from "./engine";

import { generateContentPlans } from "./engine";
import type { PlanClusterInput, PlanClusterOutput } from "./legacy-types";

export type { PlanClusterInput, PlanClusterOutput } from "./legacy-types";

export function createPlannerService() {
  return {
    async planCluster(_input: PlanClusterInput = {}): Promise<PlanClusterOutput> {
      const report = await generateContentPlans({
        opportunityLimit: 40,
        maxClusters: 8,
      });
      return {
        clusterId: report.clusterIds[0] || "",
        ideaIds: report.ideaIds,
      };
    },
    generate: generateContentPlans,
  };
}
