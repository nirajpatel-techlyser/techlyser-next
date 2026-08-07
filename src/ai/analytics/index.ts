/**
 * Growth Analytics — Phase 3 bridges opportunity ranking.
 * GSC/Bing ingest remains Phase 4.
 */

import {
  listTopOpportunities,
  runOpportunityEngine,
} from "../opportunity";

export type AnalyticsIngestInput = {
  source: "gsc" | "bing" | "pageview" | "manual";
  payload: Record<string, unknown>;
};

export type OpportunityScore = {
  keywordId?: string;
  ideaId?: string;
  score: number;
  rationale: string;
  opportunityId?: string;
  title?: string;
};

export function createAnalyticsService() {
  return {
    async ingest(_input: AnalyticsIngestInput): Promise<{ accepted: boolean }> {
      throw new Error(
        "Analytics ingest (GSC/Bing) not implemented yet — scheduled for Phase 4.",
      );
    },
    async rankOpportunities(limit = 25): Promise<OpportunityScore[]> {
      await runOpportunityEngine({ limit: Math.max(limit, 50) });
      const rows = await listTopOpportunities(limit);
      return rows.map((row) => ({
        opportunityId: row.id,
        keywordId: row.keywordId || undefined,
        ideaId: row.contentIdeaId || undefined,
        score: row.opportunityScore,
        rationale: row.rationale || "",
        title: row.title,
      }));
    },
  };
}
