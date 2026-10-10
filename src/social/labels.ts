import type { SocialPlatform } from "@/social/types";

export const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  LINKEDIN: "LinkedIn",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  GOOGLE_BUSINESS: "Google Business Profile",
};

export const LIFECYCLE_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  NEEDS_REVIEW: "Needs review",
  APPROVED: "Approved",
  READY_TO_PUBLISH: "Ready",
  PUBLISHING: "Publishing",
  PARTIALLY_PUBLISHED: "Partially published",
  PUBLISHED: "Published",
  PUBLISH_FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export function imageRequired(platform: SocialPlatform) {
  return platform === "INSTAGRAM" || platform === "GOOGLE_BUSINESS";
}
