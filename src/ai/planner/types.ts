import type {
  ContentPlanHorizon,
  PlannedContentRole,
} from "@prisma/client";

export type LinkMapNode = {
  id: string;
  title: string;
  role: PlannedContentRole | "HUB";
  path: string;
  clusterSlug?: string;
};

export type LinkMapEdge = {
  from: string;
  to: string;
  anchor: string;
  reason: string;
};

export type InternalLinkMap = {
  hubs: LinkMapNode[];
  nodes: LinkMapNode[];
  edges: LinkMapEdge[];
};

export type PlannerGenerateOptions = {
  opportunityLimit?: number;
  maxClusters?: number;
  maxSupportingPerCluster?: number;
  locale?: string;
  /** Archive previous DRAFT plans for same horizons. Default true. */
  archivePreviousDrafts?: boolean;
};

export type PlannerGenerateReport = {
  clusterIds: string[];
  planIds: Record<ContentPlanHorizon, string>;
  ideaIds: string[];
  itemCount: number;
  linkEdgeCount: number;
};

export type PlannedDraftItem = {
  role: PlannedContentRole;
  title: string;
  slugSuggestion: string;
  angle: string;
  suggestedPath: string;
  opportunityId: string;
  clusterKey: string;
  score: number;
  keywords: string[];
  category: string | null;
};
