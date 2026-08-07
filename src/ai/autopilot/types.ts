export type AutopilotStep =
  | "research"
  | "opportunities"
  | "pickTopic"
  | "write"
  | "image"
  | "seoGeo"
  | "done";

export type AutopilotTopic = {
  source: "contentIdea" | "opportunity";
  id: string;
  keyword: string;
  title: string;
  audience: string;
  searchIntent: "informational" | "commercial" | "transactional" | "navigational";
  category: string;
  tone: "premium" | "practical" | "technical" | "friendly";
  length: "short" | "medium" | "long";
  contentIdeaId?: string;
};

export type DailyAutopilotReport = {
  workflowId: string;
  runId: string;
  skipped: boolean;
  skipReason?: string;
  topic?: AutopilotTopic;
  blogId?: string;
  slug?: string;
  featuredImage?: string;
  seoScore?: number;
  geoScore?: number;
  steps: Partial<Record<AutopilotStep, { ok: boolean; detail?: string }>>;
};

export type DailyAutopilotOptions = {
  /** Skip if a successful run already exists today (default true). */
  oncePerDay?: boolean;
  /** Run research + opportunities before writing (default true). */
  refreshMarket?: boolean;
  /** Apply SEO/GEO to blog (default true). */
  applySeo?: boolean;
  /** Generate featured image via OpenAI (default true when OPENAI_API_KEY set). */
  generateImage?: boolean;
  dryRun?: boolean;
};
