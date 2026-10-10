import type { SocialPlatform } from "@/social/types";
import { facebookPublisher, instagramPublisher } from "@/social/publishers/meta";
import { googleBusinessPublisher } from "@/social/publishers/google-business";
import { linkedInPublisher } from "@/social/publishers/linkedin";
import type { SocialPublisher } from "@/social/publishers/types";

const publishers: Record<SocialPlatform, SocialPublisher> = {
  LINKEDIN: linkedInPublisher,
  INSTAGRAM: instagramPublisher,
  FACEBOOK: facebookPublisher,
  GOOGLE_BUSINESS: googleBusinessPublisher,
};

export function publisherFor(platform: SocialPlatform) {
  return publishers[platform];
}
