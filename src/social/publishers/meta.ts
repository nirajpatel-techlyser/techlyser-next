import { SocialPublishError } from "@/social/errors";
import { expectOk, sleep, socialFetch, withTransientRetry } from "@/social/http";
import type { SocialPublisher } from "@/social/publishers/types";

const GRAPH = "https://graph.facebook.com/v21.0";

export const facebookPublisher: SocialPublisher = {
  platform: "FACEBOOK",
  validate(caption) {
    if (!caption.caption.trim()) return "Facebook caption is empty.";
    return null;
  },
  async publish({ caption, account }) {
    const pageId =
      typeof account.metadata?.pageId === "string"
        ? account.metadata.pageId
        : account.externalAccountId;
    return withTransientRetry("Facebook", async () => {
      const endpoint = caption.imageUrl
        ? `${GRAPH}/${pageId}/photos`
        : `${GRAPH}/${pageId}/feed`;
      const body = new URLSearchParams();
      body.set("access_token", account.accessToken);
      if (caption.imageUrl) {
        body.set("url", caption.imageUrl);
        body.set("caption", caption.caption);
      } else {
        body.set("message", caption.caption);
        body.set("link", caption.linkUrl);
      }
      const response = await socialFetch(endpoint, { method: "POST", body });
      await expectOk(response, "Facebook");
      const data = (await response.json()) as { id?: string; post_id?: string };
      const externalPostId = data.post_id || data.id;
      if (!externalPostId) {
        throw new SocialPublishError(
          "PLATFORM_TEMPORARY",
          "Facebook did not return a post id. Retry Facebook.",
        );
      }
      return {
        externalPostId,
        publishedUrl: `https://www.facebook.com/${externalPostId}`,
      };
    });
  },
};

export const instagramPublisher: SocialPublisher = {
  platform: "INSTAGRAM",
  validate(caption) {
    if (!caption.caption.trim()) return "Instagram caption is empty.";
    if (!caption.imageUrl) return "Add an https image before publishing to Instagram.";
    return null;
  },
  async publish({ caption, account }) {
    const igId =
      typeof account.metadata?.igUserId === "string"
        ? account.metadata.igUserId
        : account.externalAccountId;
    if (!caption.imageUrl) {
      throw new SocialPublishError(
        "INVALID_IMAGE",
        "Add an https image before publishing to Instagram.",
      );
    }
    return withTransientRetry("Instagram", async () => {
      const createBody = new URLSearchParams();
      createBody.set("image_url", caption.imageUrl || "");
      createBody.set("caption", caption.caption);
      createBody.set("access_token", account.accessToken);
      const created = await socialFetch(`${GRAPH}/${igId}/media`, {
        method: "POST",
        body: createBody,
      });
      await expectOk(created, "Instagram");
      const createdData = (await created.json()) as { id?: string };
      if (!createdData.id) {
        throw new SocialPublishError(
          "INVALID_IMAGE",
          "Instagram did not accept the image. Upload a public https image and retry Instagram.",
        );
      }
      for (let i = 0; i < 5; i += 1) {
        const statusRes = await socialFetch(
          `${GRAPH}/${createdData.id}?fields=status_code`,
          { headers: { Authorization: `Bearer ${account.accessToken}` } },
        );
        await expectOk(statusRes, "Instagram");
        const status = (await statusRes.json()) as { status_code?: string };
        if (status.status_code === "FINISHED" || status.status_code === "PUBLISHED") break;
        if (status.status_code === "ERROR") {
          throw new SocialPublishError(
            "INVALID_IMAGE",
            "Instagram rejected the image. Use a JPG or PNG under 8 MB and retry Instagram.",
          );
        }
        await sleep(1500 * (i + 1));
      }
      const publishBody = new URLSearchParams();
      publishBody.set("creation_id", createdData.id);
      publishBody.set("access_token", account.accessToken);
      const published = await socialFetch(`${GRAPH}/${igId}/media_publish`, {
        method: "POST",
        body: publishBody,
      });
      await expectOk(published, "Instagram");
      const data = (await published.json()) as { id?: string };
      if (!data.id) {
        throw new SocialPublishError(
          "PLATFORM_TEMPORARY",
          "Instagram did not return a post id. Retry Instagram.",
        );
      }
      return {
        externalPostId: data.id,
        publishedUrl: null,
      };
    });
  },
};
