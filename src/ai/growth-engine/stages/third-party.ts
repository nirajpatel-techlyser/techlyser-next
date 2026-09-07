import { isOffBrandProductTopic } from "@/ai/brand/niche";
import type { GrowthCandidate } from "../types";

export type ThirdPartyFilterResult = {
  pass: boolean;
  note: string;
};

const HERO_PROMO_HINTS = [
  /\bbest\s+shopify\s+apps?\b/i,
  /\bbest\s+wordpress\s+plugins?\b/i,
  /\btop\s+\d+\s+(ai\s+)?tools?\b/i,
  /\bwhy\s+[\w.-]+\s+is\s+amazing\b/i,
  /\bproduct\s+hunt\b/i,
  /\bhow\s+to\s+(install|self[- ]host|deploy)\b/i,
  /^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i,
] as const;

/**
 * Strict third-party promotion filter.
 * Platforms may appear as context; they must not be the marketing hero.
 */
export function filterThirdParty(
  candidate: GrowthCandidate,
): ThirdPartyFilterResult {
  if (
    isOffBrandProductTopic(
      candidate.title,
      candidate.summary,
      candidate.keyword,
      ...candidate.keywords,
    )
  ) {
    return {
      pass: false,
      note: "Rejected: third-party / off-brand promotional topic",
    };
  }

  const blob = `${candidate.title}\n${candidate.summary}\n${candidate.keyword}`;
  for (const re of HERO_PROMO_HINTS) {
    if (re.test(blob) || re.test(candidate.title.trim())) {
      return {
        pass: false,
        note: "Rejected: reads like product advertising or tool listicle",
      };
    }
  }

  return { pass: true, note: "Passed third-party promotion filter" };
}
