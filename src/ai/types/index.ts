/**
 * Shared domain types for the AI Growth OS.
 * Mirror Prisma models at the TypeScript boundary (DTOs / contracts).
 * Do not import Prisma client into UI bundles — use these types instead.
 */

export type AiModuleId =
  | "agents"
  | "research"
  | "writer"
  | "seo"
  | "geo"
  | "planner"
  | "analytics"
  | "memory"
  | "prompts";

export type AiModuleContract = {
  id: AiModuleId;
  name: string;
  responsibility: string;
  inputs: string[];
  outputs: string[];
  dependsOn: AiModuleId[];
  phase: number;
};

export type KeywordIntent =
  | "INFORMATIONAL"
  | "COMMERCIAL"
  | "TRANSACTIONAL"
  | "NAVIGATIONAL";

export type KeywordStatus =
  | "DISCOVERED"
  | "QUEUED"
  | "RESEARCHING"
  | "READY"
  | "ARCHIVED";

export type TopicStatus =
  | "IDEATION"
  | "PLANNED"
  | "IN_PROGRESS"
  | "PUBLISHED"
  | "ARCHIVED";

export type ResearchStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED";

export type ContentIdeaStatus =
  | "DRAFT"
  | "APPROVED"
  | "REJECTED"
  | "QUEUED"
  | "PUBLISHED";

export type PublishQueueStatus =
  | "PENDING"
  | "SCHEDULED"
  | "PROCESSING"
  | "PUBLISHED"
  | "FAILED"
  | "CANCELLED";

export type ClusterStatus = "PLANNED" | "ACTIVE" | "COMPLETE";

export type PromptTemplateKind =
  | "SYSTEM"
  | "RESEARCH"
  | "WRITER"
  | "SEO"
  | "GEO"
  | "PLANNER"
  | "ANALYTICS";

export type AgentRunStatus =
  | "QUEUED"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED";

/** Module registry — source of truth for Admin AI Studio architecture view. */
export const AI_MODULE_REGISTRY: AiModuleContract[] = [
  {
    id: "agents",
    name: "Agent Orchestrator",
    responsibility:
      "Coordinates multi-step growth workflows across research → plan → write → SEO/GEO → publish → measure.",
    inputs: ["workflow definition", "AiSettings", "memory context"],
    outputs: ["agent run traces", "task fan-out"],
    dependsOn: ["memory", "prompts"],
    phase: 2,
  },
  {
    id: "research",
    name: "Research Engine",
    responsibility:
      "Discovers SERP/intent signals, competitor gaps, and source packs for a keyword or topic.",
    inputs: ["Keyword", "Competitor", "locale"],
    outputs: ["Research documents", "entities", "citations"],
    dependsOn: ["memory", "prompts"],
    phase: 2,
  },
  {
    id: "planner",
    name: "Content Planner",
    responsibility:
      "Turns research into clusters, outlines, calendars, and prioritized ContentIdeas.",
    inputs: ["Research", "ContentCluster", "Keyword", "Opportunity"],
    outputs: ["ContentIdea", "ContentPlan", "PublishingQueue drafts", "link map"],
    dependsOn: ["research", "prompts"],
    phase: 4,
  },
  {
    id: "writer",
    name: "Writer Engine",
    responsibility:
      "Drafts long-form content compatible with TipTap/Blog CMS, with brand voice and EEAT structure.",
    inputs: ["ContentIdea", "Research", "PromptTemplate"],
    outputs: ["draft HTML/MD", "outline", "FAQ blocks"],
    dependsOn: ["planner", "memory", "prompts"],
    phase: 5,
  },
  {
    id: "seo",
    name: "SEO Optimizer",
    responsibility:
      "Applies on-page SEO: titles, metas, headings, internal links, schema hints aligned to src/lib/seo.",
    inputs: ["draft", "Keyword", "ContentCluster"],
    outputs: ["seoTitle", "seoDescription", "slug", "link map"],
    dependsOn: ["writer", "prompts"],
    phase: 6,
  },
  {
    id: "geo",
    name: "GEO / Answer Engine Optimizer",
    responsibility:
      "Optimizes passages for AI Overviews, ChatGPT, Perplexity, citations, entity consistency, llms.txt alignment.",
    inputs: ["draft", "brand entity graph", "FAQs"],
    outputs: ["speakable blocks", "entity checklist", "citation-ready summaries"],
    dependsOn: ["seo", "prompts"],
    phase: 6,
  },
  {
    id: "analytics",
    name: "Growth Analytics",
    responsibility:
      "Ingests GSC/Bing/site metrics into AiAnalytics; scores content ROI and feeds planner.",
    inputs: ["PageView", "GSC exports", "publish events"],
    outputs: ["AiAnalytics events", "opportunity scores"],
    dependsOn: ["memory"],
    phase: 4,
  },
  {
    id: "memory",
    name: "Memory Layer",
    responsibility:
      "Stores durable brand facts, prior decisions, embeddings refs, and run context for agents.",
    inputs: ["brand profile", "run traces", "approved facts"],
    outputs: ["retrieved context windows"],
    dependsOn: [],
    phase: 2,
  },
  {
    id: "prompts",
    name: "Prompt Catalog",
    responsibility:
      "Versioned PromptTemplates with variables, guardrails, and evaluation hooks.",
    inputs: ["PromptTemplateKind", "variables"],
    outputs: ["rendered prompt", "template version"],
    dependsOn: [],
    phase: 2,
  },
];
