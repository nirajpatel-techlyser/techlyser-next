import { SocialPublishError } from "@/social/errors";
import { expectOk, socialFetch, withTransientRetry } from "@/social/http";
import type { PublisherAccount } from "@/social/publishers/types";
import type { SocialPublisher } from "@/social/publishers/types";

async function accessToken(account: PublisherAccount) {
  if (!account.expiresAt || account.expiresAt.getTime() > Date.now() + 60_000) {
    return account.accessToken;
  }
  if (!account.refreshToken) {
    throw new SocialPublishError(
      "AUTH",
      "Google Business Profile authorization has expired. Reconnect Google Business Profile.",
    );
  }
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    refresh_token: account.refreshToken,
    grant_type: "refresh_token",
  });
  const response = await socialFetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  await expectOk(response, "Google Business Profile");
  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new SocialPublishError(
      "AUTH",
      "Google Business Profile authorization has expired. Reconnect Google Business Profile.",
    );
  }
  return data.access_token;
}

export const googleBusinessPublisher: SocialPublisher = {
  platform: "GOOGLE_BUSINESS",
  validate(caption) {
    if (!caption.caption.trim()) return "Google Business caption is empty.";
    if (!caption.imageUrl) {
      return "Add an https image before publishing to Google Business Profile.";
    }
    return null;
  },
  async publish({ caption, account }) {
    const location =
      typeof account.metadata?.locationName === "string" ? account.metadata.locationName : "";
    if (!location) {
      throw new SocialPublishError(
        "CONFIG",
        "Google Business Profile has no location yet. Reconnect Google Business Profile.",
      );
    }
    return withTransientRetry("Google Business Profile", async () => {
      const token = await accessToken(account);
      const response = await socialFetch(
        `https://mybusiness.googleapis.com/v4/${location}/localPosts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            languageCode: "en-IN",
            summary: caption.caption,
            callToAction: { actionType: "LEARN_MORE", url: caption.linkUrl },
            ...(caption.imageUrl
              ? { media: [{ mediaFormat: "PHOTO", sourceUrl: caption.imageUrl }] }
              : {}),
          }),
        },
      );
      await expectOk(response, "Google Business Profile");
      const data = (await response.json()) as { name?: string; searchUrl?: string };
      if (!data.name) {
        throw new SocialPublishError(
          "PLATFORM_TEMPORARY",
          "Google Business Profile did not return a post id. Retry Google Business Profile.",
        );
      }
      return {
        externalPostId: data.name,
        publishedUrl: data.searchUrl || null,
      };
    });
  },
};
