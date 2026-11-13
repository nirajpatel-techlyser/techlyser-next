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

function linkedInContent(mediaIds: string[]) {
  if (mediaIds.length === 0) return {};
  if (mediaIds.length === 1) {
    return { content: { media: { id: mediaIds[0] } } };
  }
  return {
    content: {
      multiImage: {
        images: mediaIds.map((id) => ({ id })),
      },
    },
  };
}

async function createLinkedInPost(input: {
  token: string;
  author: string;
  caption: string;
  mediaIds: string[];
}) {
  return withTransientRetry("LinkedIn", async () => {
    const response = await socialFetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": VERSION,
      },
      body: JSON.stringify({
        author: input.author,
        commentary: input.caption,
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        ...linkedInContent(input.mediaIds),
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
}

async function uploadLinkedInImages(input: {
  token: string;
  owner: string;
  images: { bytes: Buffer; mime: string }[];
}) {
  const mediaIds: string[] = [];
  for (const image of input.images) {
    const mediaId = await uploadLinkedInImage({
      token: input.token,
      owner: input.owner,
      bytes: image.bytes,
      mime: image.mime,
    });
    mediaIds.push(mediaId);
  }
  return mediaIds;
}

export const linkedInPublisher: SocialPublisher = {
  platform: "LINKEDIN",
  validate(caption) {
    if (!caption.caption.trim()) return "LinkedIn caption is empty.";
    return null;
  },
  async publish({ caption, account, image, images, resume }) {
    const person =
      typeof account.metadata?.personUrn === "string"
        ? account.metadata.personUrn
        : `urn:li:person:${account.externalAccountId}`;
    const organization =
      typeof account.metadata?.organizationUrn === "string"
        ? account.metadata.organizationUrn
        : null;

    const payloads =
      images && images.length > 0 ? images : image ? [image] : [];

    let profileId = resume?.externalPostId || "";
    let profileUrl = resume?.publishedUrl ?? null;
    if (!profileId) {
      const mediaIds =
        payloads.length > 0
          ? await uploadLinkedInImages({
              token: account.accessToken,
              owner: person,
              images: payloads,
            })
          : [];
      const posted = await createLinkedInPost({
        token: account.accessToken,
        author: person,
        caption: caption.caption,
        mediaIds,
      });
      profileId = posted.externalPostId;
      profileUrl = posted.publishedUrl;
    }

    if (!organization) {
      return { externalPostId: profileId, publishedUrl: profileUrl };
    }

    if (resume?.secondaryExternalPostId) {
      return {
        externalPostId: profileId,
        publishedUrl: profileUrl,
        secondaryExternalPostId: resume.secondaryExternalPostId,
        secondaryPublishedUrl: resume.secondaryPublishedUrl,
      };
    }

    try {
      const mediaIds =
        payloads.length > 0
          ? await uploadLinkedInImages({
              token: account.accessToken,
              owner: organization,
              images: payloads,
            })
          : [];
      const page = await createLinkedInPost({
        token: account.accessToken,
        author: organization,
        caption: caption.caption,
        mediaIds,
      });
      return {
        externalPostId: profileId,
        publishedUrl: profileUrl,
        secondaryExternalPostId: page.externalPostId,
        secondaryPublishedUrl: page.publishedUrl,
      };
    } catch (error) {
      const mapped =
        error instanceof SocialPublishError
          ? error
          : new SocialPublishError("UNKNOWN", "LinkedIn Page publishing failed.");
      mapped.partial = {
        externalPostId: profileId,
        publishedUrl: profileUrl,
      };
      throw mapped;
    }
  },
};
