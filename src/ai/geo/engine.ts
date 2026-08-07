import type { GeoOptimizeInput, GeoOptimizeOutput } from "./types";
import {
  extractSpeakablePassages,
  optimizeAllEngines,
  optimizeCitationSummary,
  optimizeEntityCoverage,
  optimizeKnowledgeGraph,
  optimizeLlmsTxtHints,
} from "./modules";

function scoreGeo(
  output: Omit<GeoOptimizeOutput, "score" | "modules">,
  schemaTypeCount: number,
): number {
  let score = 30;
  const coverage =
    output.entityCoverage.total > 0
      ? output.entityCoverage.covered / output.entityCoverage.total
      : 0;
  score += Math.round(coverage * 30);
  if (output.speakablePassages.length >= 3) score += 10;
  if (output.engines.length >= 5) score += 10;
  if (output.citationSummary.length >= 80) score += 8;
  if (output.knowledgeGraph.relatedEntities.length >= 2) score += 8;
  if (schemaTypeCount >= 2) score += 4;
  return Math.min(100, score);
}

export function optimizeGeo(input: GeoOptimizeInput): GeoOptimizeOutput {
  const coverage = optimizeEntityCoverage(input);
  const knowledgeGraph = optimizeKnowledgeGraph({
    title: input.title,
    primaryKeyword: input.primaryKeyword,
    entities: coverage.entities,
    canonicalUrl: input.canonicalUrl,
  });
  const engines = optimizeAllEngines(input);
  const speakablePassages = extractSpeakablePassages(
    input.content,
    input.faqs,
  );
  const citationSummary = optimizeCitationSummary(input);
  const llmsTxtHints = optimizeLlmsTxtHints(input);

  const issues: string[] = [];
  if (coverage.missing.length > 0) {
    issues.push(`Missing entities: ${coverage.missing.slice(0, 5).join(", ")}`);
  }
  if (speakablePassages.length < 2) {
    issues.push("Fewer than 2 speakable passages extracted");
  }
  if (!input.schemaTypes?.includes("FAQPage")) {
    issues.push("FAQPage schema missing — weaker AI Overview signal");
  }

  const partial: Omit<GeoOptimizeOutput, "score" | "modules"> = {
    entities: coverage.entities,
    entityCoverage: {
      covered: coverage.covered,
      total: coverage.total,
      missing: coverage.missing,
    },
    knowledgeGraph,
    engines,
    citationSummary,
    speakablePassages,
    llmsTxtHints,
    issues,
  };

  return {
    ...partial,
    modules: [
      "entities",
      "knowledgeGraph",
      "chatgpt",
      "gemini",
      "claude",
      "perplexity",
      "aiOverviews",
      "citation",
      "speakable",
      "llmsTxt",
    ],
    score: scoreGeo(partial, input.schemaTypes?.length || 0),
  };
}

export function createGeoService() {
  return {
    optimize: async (input: GeoOptimizeInput) => optimizeGeo(input),
  };
}
