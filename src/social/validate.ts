import { imageRequired, PLATFORM_LABEL } from "@/social/labels";
import { isPublicHttpsUrl } from "@/social/content";
import type { SocialPlatform } from "@/social/types";

export type PublishGateInput = {
  websitePublished: boolean;
  approved: boolean;
  hasContent: boolean;
  featuredImage: string | null;
  selected: SocialPlatform[];
  connected: SocialPlatform[];
};

export function evaluatePublish(input: PublishGateInput) {
  const reasons: string[] = [];
  if (!input.hasContent) {
    reasons.push("Add a title and post content before publishing.");
  }
  if (!input.websitePublished) {
    reasons.push("Publish the website post first so the social link is live.");
  }
  if (!input.approved) {
    reasons.push("Approve the post before publishing to social platforms.");
  }
  if (input.selected.length === 0) {
    reasons.push("Select at least one platform.");
  }
  const connected = new Set(input.connected);
  if (input.connected.length === 0) {
    reasons.push("Connect at least one social account.");
  }
  for (const platform of input.selected) {
    const label = PLATFORM_LABEL[platform];
    if (!connected.has(platform)) {
      reasons.push(`Connect ${label} before publishing there.`);
    }
    if (imageRequired(platform) && !isPublicHttpsUrl(input.featuredImage)) {
      reasons.push(`Add an https image before publishing to ${label}.`);
    }
  }
  return { ok: reasons.length === 0, reasons };
}
