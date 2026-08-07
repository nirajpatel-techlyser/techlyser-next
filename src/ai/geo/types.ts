export type GeoAnswerEngine =
  | "chatgpt"
  | "gemini"
  | "claude"
  | "perplexity"
  | "aiOverviews";

export type GeoEntity = {
  name: string;
  type: string;
  sameAs?: string[];
  present: boolean;
  recommendedMention?: string;
};

export type GeoEngineHint = {
  engine: GeoAnswerEngine;
  priority: "high" | "medium" | "low";
  extractableAnswer: string;
  citations: string[];
  tips: string[];
};

export type GeoOptimizeInput = {
  title: string;
  content: string;
  primaryKeyword: string;
  faqs?: { question: string; answer: string }[];
  canonicalUrl?: string;
  schemaTypes?: string[];
  brandEntities?: string[];
};

export type GeoOptimizeOutput = {
  score: number;
  modules: string[];
  entities: GeoEntity[];
  entityCoverage: {
    covered: number;
    total: number;
    missing: string[];
  };
  knowledgeGraph: {
    primaryEntity: string;
    relatedEntities: string[];
    sameAs: string[];
    jsonLdHint: Record<string, unknown>;
  };
  engines: GeoEngineHint[];
  citationSummary: string;
  speakablePassages: string[];
  llmsTxtHints: string[];
  issues: string[];
};
