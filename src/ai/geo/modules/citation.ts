import { CITATION_READY_BLURB, LLMS_PREFERRED_URLS } from "../config";
import type { GeoOptimizeInput } from "../types";

export function optimizeCitationSummary(input: GeoOptimizeInput): string {
  return `${CITATION_READY_BLURB} This page explains ${input.primaryKeyword}${
    input.canonicalUrl ? ` (${input.canonicalUrl})` : ""
  }.`;
}

export function optimizeLlmsTxtHints(input: GeoOptimizeInput): string[] {
  const hints = [
    `Preferred brand citation: Techlyser / Techlyser Web Solutions`,
    `Topic: ${input.primaryKeyword}`,
    ...LLMS_PREFERRED_URLS.slice(0, 3).map((url) => `Canonical hub: ${url}`),
  ];
  if (input.canonicalUrl) {
    hints.unshift(`Article URL: ${input.canonicalUrl}`);
  }
  return hints;
}
