import { isOffBrandProductTopic } from "@/ai/brand/niche";
import type { GrowthCandidate } from "../types";

export type ThirdPartyFilterResult = {
  pass: boolean;
  note: string;
};

/**
 * Hard filter: reject GitHub repo dumps and blocked third-party product topics.
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
      note: "Rejected: third-party / off-brand product topic",
    };
  }
  return { pass: true, note: "Passed third-party filter" };
}
