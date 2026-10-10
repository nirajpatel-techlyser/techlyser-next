import type { SocialAttemptStatus, SocialLifecycleStatus } from "@/social/types";

export function rollupAttemptStatus(
  statuses: SocialAttemptStatus[],
): SocialLifecycleStatus {
  if (statuses.length === 0) return "NEEDS_REVIEW";
  if (statuses.some((status) => status === "PUBLISHING" || status === "PENDING")) {
    return "PUBLISHING";
  }
  const published = statuses.filter((status) => status === "PUBLISHED" || status === "SKIPPED");
  const failed = statuses.filter((status) => status === "FAILED");
  if (published.length > 0 && failed.length > 0) return "PARTIALLY_PUBLISHED";
  if (failed.length === statuses.length) return "PUBLISH_FAILED";
  if (published.length === statuses.length) return "PUBLISHED";
  return "PUBLISH_FAILED";
}

export function lifecycleBeforePublish(input: {
  approved: boolean;
  ready: boolean;
}): SocialLifecycleStatus {
  if (!input.approved) return "NEEDS_REVIEW";
  if (input.ready) return "READY_TO_PUBLISH";
  return "APPROVED";
}
