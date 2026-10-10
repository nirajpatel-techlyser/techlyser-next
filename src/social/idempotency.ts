import { createHash } from "crypto";
import type { SocialAttemptStatus, SocialPlatform } from "@/social/types";

export type PriorAttempt = {
  platform: SocialPlatform;
  status: SocialAttemptStatus;
  contentHash: string;
};

export type PlannedAction = {
  platform: SocialPlatform;
  contentHash: string;
  action: "skip_published" | "publish" | "in_flight" | "already_failed";
};

export function attemptKey(blogId: string, platform: SocialPlatform, contentHash: string) {
  return createHash("sha256")
    .update(`${blogId}:${platform}:${contentHash}`)
    .digest("hex");
}

export function jobKey(blogId: string, platforms: SocialPlatform[], hashes: string[]) {
  return createHash("sha256")
    .update(`${blogId}|${[...platforms].sort().join(",")}|${[...hashes].sort().join(",")}`)
    .digest("hex");
}

export function planPublishingActions(
  priors: PriorAttempt[],
  next: { platform: SocialPlatform; contentHash: string }[],
): PlannedAction[] {
  return next.map((item) => {
    const prior = priors.find(
      (row) => row.platform === item.platform && row.contentHash === item.contentHash,
    );
    if (!prior) {
      return { ...item, action: "publish" };
    }
    if (prior.status === "PUBLISHED" || prior.status === "SKIPPED") {
      return { ...item, action: "skip_published" };
    }
    if (prior.status === "PUBLISHING" || prior.status === "PENDING") {
      return { ...item, action: "in_flight" };
    }
    return { ...item, action: "already_failed" };
  });
}
