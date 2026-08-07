/**
 * Agent Orchestrator — contracts only (Phase 1).
 *
 * Responsibility:
 * - Define workflows (graphs of steps)
 * - Schedule / cancel agent runs
 * - Enforce budgets, timeouts, and human-approval gates
 * - Never call LLMs directly; delegates to research/writer/seo/geo modules
 */

import type { AgentRunStatus } from "../types";

export type AgentStepId =
  | "research"
  | "plan"
  | "write"
  | "seo"
  | "geo"
  | "queue"
  | "measure";

export type AgentWorkflowDefinition = {
  id: string;
  name: string;
  steps: AgentStepId[];
  requiresApproval: boolean;
};

export type AgentRunRequest = {
  workflowId: string;
  topicId?: string;
  keywordId?: string;
  ideaId?: string;
  triggeredByUserId?: string;
};

export type AgentRunResult = {
  runId: string;
  status: AgentRunStatus;
  step: AgentStepId | null;
  error?: string;
};

export const DEFAULT_GROWTH_WORKFLOW: AgentWorkflowDefinition = {
  id: "growth.default",
  name: "Research → Plan → Write → SEO → GEO → Queue",
  steps: ["research", "plan", "write", "seo", "geo", "queue", "measure"],
  requiresApproval: true,
};

/** Phase 1 stub — wired in Phase 2. */
export function createAgentOrchestrator() {
  return {
    listWorkflows(): AgentWorkflowDefinition[] {
      return [DEFAULT_GROWTH_WORKFLOW];
    },
    async enqueue(_request: AgentRunRequest): Promise<AgentRunResult> {
      return {
        runId: "phase1-noop",
        status: "CANCELLED",
        step: null,
        error: "Agent orchestrator not implemented (Phase 1 architecture only).",
      };
    },
  };
}
