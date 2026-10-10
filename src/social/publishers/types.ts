import type { SocialCaption, SocialPlatform } from "@/social/types";

export type PublisherAccount = {
  id: string;
  platform: SocialPlatform;
  label: string;
  externalAccountId: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  metadata: Record<string, unknown> | null;
};

export type PublishOutput = {
  externalPostId: string;
  publishedUrl: string | null;
};

export type ImagePayload = {
  bytes: Buffer;
  mime: string;
};

export interface SocialPublisher {
  platform: SocialPlatform;
  validate(caption: SocialCaption): string | null;
  publish(input: {
    caption: SocialCaption;
    account: PublisherAccount;
    image: ImagePayload | null;
  }): Promise<PublishOutput>;
}
