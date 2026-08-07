import type { PlannedContentRole } from "@prisma/client";
import { PLANNER_HUBS } from "./config";
import type { OpportunityClusterGroup } from "./cluster";
import type { InternalLinkMap, LinkMapEdge, LinkMapNode } from "./types";

function nodeId(clusterSlug: string, role: PlannedContentRole, slug: string) {
  return `${clusterSlug}:${role.toLowerCase()}:${slug}`;
}

/**
 * Build pillar ↔ supporting links + hub connections for crawlable topical silos.
 */
export function buildInternalLinkMap(
  clusters: OpportunityClusterGroup[],
): InternalLinkMap {
  const hubs: LinkMapNode[] = PLANNER_HUBS.map((hub) => ({
    id: hub.id,
    title: hub.title,
    role: "HUB",
    path: hub.path,
  }));

  const nodes: LinkMapNode[] = [];
  const edges: LinkMapEdge[] = [];

  for (const cluster of clusters) {
    const pillar = cluster.items.find((i) => i.role === "PILLAR");
    if (!pillar) continue;

    const pillarNodeId = nodeId(cluster.slug, "PILLAR", pillar.slugSuggestion);
    nodes.push({
      id: pillarNodeId,
      title: pillar.title,
      role: "PILLAR",
      path: pillar.suggestedPath,
      clusterSlug: cluster.slug,
    });

    // Pillar → hubs
    for (const hub of hubs) {
      edges.push({
        from: pillarNodeId,
        to: hub.id,
        anchor: hub.title,
        reason: "Connect pillar to commercial/resource hub",
      });
    }

    for (const supporting of cluster.items.filter((i) => i.role === "SUPPORTING")) {
      const supportId = nodeId(
        cluster.slug,
        "SUPPORTING",
        supporting.slugSuggestion,
      );
      nodes.push({
        id: supportId,
        title: supporting.title,
        role: "SUPPORTING",
        path: supporting.suggestedPath,
        clusterSlug: cluster.slug,
      });

      edges.push({
        from: supportId,
        to: pillarNodeId,
        anchor: pillar.title,
        reason: "Supporting article links up to pillar",
      });
      edges.push({
        from: pillarNodeId,
        to: supportId,
        anchor: supporting.title,
        reason: "Pillar links down to supporting article",
      });

      // Light hub link from supporting
      edges.push({
        from: supportId,
        to: "hub-resources",
        anchor: "Free Resources",
        reason: "Supporting content CTA to resources hub",
      });
    }
  }

  // Cross-link adjacent pillars for silo discovery
  const pillars = nodes.filter((n) => n.role === "PILLAR");
  for (let i = 0; i < pillars.length; i += 1) {
    const next = pillars[(i + 1) % pillars.length];
    if (!next || next.id === pillars[i].id) continue;
    edges.push({
      from: pillars[i].id,
      to: next.id,
      anchor: next.title,
      reason: "Adjacent pillar cross-link",
    });
  }

  return { hubs, nodes, edges };
}

export function outboundLinksForItem(
  linkMap: InternalLinkMap,
  itemPath: string,
): LinkMapEdge[] {
  const node = [...linkMap.hubs, ...linkMap.nodes].find((n) => n.path === itemPath);
  if (!node) return [];
  return linkMap.edges.filter((e) => e.from === node.id);
}
