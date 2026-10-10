import { SocialPublishError } from "@/social/errors";
import { expectOk, socialFetch, withTransientRetry } from "@/social/http";
import type { SocialPublisher } from "@/social/publishers/types";

const VERSION = "202511";

async function uploadLinkedInImage(input: {
  token: string;
  owner: string;
  bytes: Buffer;
  mime: string;
}) {
  const init = await socialFetch("https://api.linkedin.com/rest/images?action=initializeUpload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      "LinkedIn-Version": VERSION,
    },
    body: JSON.stringify({
      initializeUploadRequest: { owner: input.owner },
    }),
  });
  await expectOk(init, "LinkedIn");
  const data = (await init.json()) as {
    value?: { uploadUrl?: string; image?: string };
  };
  const uploadUrl = data.value?.uploadUrl;
  const imageUrn = data.value?.image;
  if (!uploadUrl || !imageUrn) {
    throw new SocialPublishError(
      "INVALID_IMAGE",
      "LinkedIn did not accept the image upload. Retry LinkedIn.",
    );
  }
  const uploaded = await socialFetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${input.token}`,
      "Content-Type": input.mime,
    },
    body: new Uint8Array(input.bytes),
  });
  await expectOk(uploaded, "LinkedIn");
  return imageUrn;
}

export const linkedInPublisher: SocialPublisher = {
  platform: "LINKEDIN",
  validate(caption) {
    if (!caption.caption.trim()) return "LinkedIn caption is empty.";
    return null;
  },
  async publish({ caption, account, image }) {
    const author =
      typeof account.metadata?.personUrn === "string"
        ? account.metadata.personUrn
        : `urn:li:person:${account.externalAccountId}`;
    return withTransientRetry("LinkedIn", async () => {
      let mediaId: string | null = null;
      if (image && caption.imageUrl) {
        mediaId = await uploadLinkedInImage({
          token: account.accessToken,
          owner: author,
          bytes: image.bytes,
          mime: image.mime,
        });
      }
      const response = await socialFetch("https://api.linkedin.com/rest/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
          "LinkedIn-Version": VERSION,
        },
        body: JSON.stringify({
          author,
          commentary: caption.caption,
          visibility: "PUBLIC",
          distribution: {
            feedDistribution: "MAIN_FEED",
            targetEntities: [],
            thirdPartyDistributionChannels: [],
          },
          ...(mediaId ? { content: { media: { id: mediaId } } } : {}),
          lifecycleState: "PUBLISHED",
          isReshareDisabledByAuthor: false,
        }),
      });
      await expectOk(response, "LinkedIn");
      const postId = response.headers.get("x-restli-id") || "";
      if (!postId) {
        throw new SocialPublishError(
          "PLATFORM_TEMPORARY",
          "LinkedIn did not return a post id. Retry LinkedIn.",
        );
      }
      return {
        externalPostId: postId,
        publishedUrl: `https://www.linkedin.com/feed/update/${encodeURIComponent(postId)}`,
      };
    });
  },
};
