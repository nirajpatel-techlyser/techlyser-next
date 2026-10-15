export const SOCIAL_PLATFORMS = [
  "LINKEDIN",
  "INSTAGRAM",
  "FACEBOOK",
  "GOOGLE_BUSINESS",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export type SocialLifecycleStatus =
  | "DRAFT"
  | "NEEDS_REVIEW"
  | "APPROVED"
  | "READY_TO_PUBLISH"
  | "PUBLISHING"
  | "PARTIALLY_PUBLISHED"
  | "PUBLISHED"
  | "PUBLISH_FAILED"
  | "CANCELLED";

export type SocialAttemptStatus =
  | "PENDING"
  | "PUBLISHING"
  | "PUBLISHED"
  | "FAILED"
  | "SKIPPED";

export type SocialJobStatus =
  | "QUEUED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type WebsitePostSource = {
  blogId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  tags: string[];
  linkedinPersonalPost: string;
  linkedinPagePost: string;
  websiteStatus: "DRAFT" | "PUBLISHED";
};

export type SocialCaption = {
  platform: SocialPlatform;
  caption: string;
  hashtags: string[];
  linkUrl: string;
  imageUrl: string | null;
  sourceHash: string;
  contentHash: string;
};

export type AttemptSnapshot = {
  id: string;
  platform: SocialPlatform;
  status: SocialAttemptStatus;
  publishedUrl: string | null;
  secondaryPublishedUrl: string | null;
  errorMessage: string | null;
  retryable: boolean;
  contentHash: string;
  externalPostId: string | null;
};

export type PlatformPreview = {
  platform: SocialPlatform;
  label: string;
  caption: string;
  hashtags: string[];
  linkUrl: string;
  imageUrl: string | null;
  imageRequired: boolean;
  connected: boolean;
  accountLabel: string | null;
  blockReason: string | null;
  attempt: AttemptSnapshot | null;
};

export type SocialPublishView = {
  blogId: string;
  lifecycle: SocialLifecycleStatus;
  approved: boolean;
  websitePublished: boolean;
  featuredImage: string | null;
  canPublish: boolean;
  reasons: string[];
  platforms: PlatformPreview[];
  activeJobId: string | null;
};

export function isSocialPlatform(value: string): value is SocialPlatform {
  return (SOCIAL_PLATFORMS as readonly string[]).includes(value);
}
