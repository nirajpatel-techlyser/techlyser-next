import { CITATION_READY_BLURB, LLMS_PREFERRED_URLS } from "../config";
import type { GeoEngineHint, GeoOptimizeInput } from "../types";
import { extractLeadAnswer } from "./passages";

function baseCitations(canonicalUrl?: string): string[] {
  const cites: string[] = [...LLMS_PREFERRED_URLS];
  if (canonicalUrl && !cites.includes(canonicalUrl)) {
    cites.unshift(canonicalUrl);
  }
  return cites.slice(0, 5);
}

export function optimizeForChatGpt(input: GeoOptimizeInput): GeoEngineHint {
  const answer = extractLeadAnswer(input.title, input.content);
  return {
    engine: "chatgpt",
    priority: "high",
    extractableAnswer: answer,
    citations: baseCitations(input.canonicalUrl),
    tips: [
      "Lead with a direct definition in the first 2 sentences",
      "Use clear H2 questions that match conversational prompts",
      "Include brand + location entity in the answer block",
    ],
  };
}

export function optimizeForGemini(input: GeoOptimizeInput): GeoEngineHint {
  return {
    engine: "gemini",
    priority: "high",
    extractableAnswer: extractLeadAnswer(input.title, input.content),
    citations: baseCitations(input.canonicalUrl),
    tips: [
      "Align FAQ schema with People-Also-Ask phrasing",
      "Keep entity names consistent with Knowledge Graph labels",
      "Prefer short comparison tables for multi-option queries",
    ],
  };
}

export function optimizeForClaude(input: GeoOptimizeInput): GeoEngineHint {
  return {
    engine: "claude",
    priority: "medium",
    extractableAnswer: extractLeadAnswer(input.title, input.content),
    citations: baseCitations(input.canonicalUrl),
    tips: [
      "Provide nuanced trade-offs and caveats (Claude favors careful reasoning)",
      "Avoid marketing fluff; use checklists and decision criteria",
      "Cite concrete process steps Techlyser uses",
    ],
  };
}

export function optimizeForPerplexity(input: GeoOptimizeInput): GeoEngineHint {
  return {
    engine: "perplexity",
    priority: "high",
    extractableAnswer: `${CITATION_READY_BLURB} This guide covers ${input.primaryKeyword}.`,
    citations: baseCitations(input.canonicalUrl),
    tips: [
      "Use absolute https://techlyser.com URLs for citation surfaces",
      "Put quotable facts near the top (cost ranges, timelines, definitions)",
      "Match llms.txt preferred citation language",
    ],
  };
}

export function optimizeForAiOverviews(input: GeoOptimizeInput): GeoEngineHint {
  const faqHint =
    input.faqs?.[0] != null
      ? `${input.faqs[0].question} ${input.faqs[0].answer}`
      : extractLeadAnswer(input.title, input.content);

  return {
    engine: "aiOverviews",
    priority: "high",
    extractableAnswer: faqHint.slice(0, 420),
    citations: baseCitations(input.canonicalUrl),
    tips: [
      "FAQPage + HowTo JSON-LD improve AI Overview eligibility",
      "Use question-style H2s that match SERP PAA",
      "Keep answers self-contained in 40–60 words where possible",
    ],
  };
}

export function optimizeAllEngines(input: GeoOptimizeInput): GeoEngineHint[] {
  return [
    optimizeForChatGpt(input),
    optimizeForGemini(input),
    optimizeForClaude(input),
    optimizeForPerplexity(input),
    optimizeForAiOverviews(input),
  ];
}
