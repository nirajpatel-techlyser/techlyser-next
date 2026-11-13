import { SocialPublishError } from "@/social/errors";
import { expectOk, sleep, socialFetch, withTransientRetry } from "@/social/http";
import type { SocialPublisher } from "@/social/publishers/types";

const GRAPH = "https://graph.facebook.com/v21.0";

function captionImageUrls(caption: { imageUrl: string | null; imageUrls?: string[] }) {
  if (caption.imageUrls && caption.imageUrls.length > 0) return caption.imageUrls;
  return caption.imageUrl ? [caption.imageUrl] : [];
}

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
    const imageUrls = captionImageUrls(caption);
    return withTransientRetry("Facebook", async () => {
      if (imageUrls.length <= 1) {
        const endpoint = imageUrls[0]
          ? `${GRAPH}/${pageId}/photos`
          : `${GRAPH}/${pageId}/feed`;
        const body = new URLSearchParams();
        body.set("access_token", account.accessToken);
        if (imageUrls[0]) {
          body.set("url", imageUrls[0]);
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
      }

      const mediaIds: string[] = [];
      for (const url of imageUrls) {
        const body = new URLSearchParams();
        body.set("access_token", account.accessToken);
        body.set("url", url);
        body.set("published", "false");
        const uploaded = await socialFetch(`${GRAPH}/${pageId}/photos`, {
          method: "POST",
          body,
        });
        await expectOk(uploaded, "Facebook");
        const data = (await uploaded.json()) as { id?: string };
        if (!data.id) {
          throw new SocialPublishError(
            "INVALID_IMAGE",
            "Facebook did not accept one of the social images. Retry Facebook.",
          );
        }
        mediaIds.push(data.id);
      }

      const feed = new URLSearchParams();
      feed.set("access_token", account.accessToken);
      feed.set("message", caption.caption);
      feed.set(
        "attached_media",
        JSON.stringify(mediaIds.map((id) => ({ media_fbid: id }))),
      );
      const response = await socialFetch(`${GRAPH}/${pageId}/feed`, {
        method: "POST",
        body: feed,
      });
      await expectOk(response, "Facebook");
      const data = (await response.json()) as { id?: string };
      if (!data.id) {
        throw new SocialPublishError(
          "PLATFORM_TEMPORARY",
          "Facebook did not return a post id. Retry Facebook.",
        );
      }
      return {
        externalPostId: data.id,
        publishedUrl: `https://www.facebook.com/${data.id}`,
      };
    });
  },
};

async function waitForIgContainer(containerId: string, token: string) {
  for (let i = 0; i < 8; i += 1) {
    const statusRes = await socialFetch(
      `${GRAPH}/${containerId}?fields=status_code`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    await expectOk(statusRes, "Instagram");
    const status = (await statusRes.json()) as { status_code?: string };
    if (status.status_code === "FINISHED" || status.status_code === "PUBLISHED") {
      return;
    }
    if (status.status_code === "ERROR") {
      throw new SocialPublishError(
        "INVALID_IMAGE",
        "Instagram rejected an image. Use JPG or PNG under 8 MB and retry Instagram.",
      );
    }
    await sleep(1500 * (i + 1));
  }
}

export const instagramPublisher: SocialPublisher = {
  platform: "INSTAGRAM",
  validate(caption) {
    if (!caption.caption.trim()) return "Instagram caption is empty.";
    if (captionImageUrls(caption).length === 0) {
      return "Add social images or a featured https image before publishing to Instagram.";
    }
    return null;
  },
  async publish({ caption, account }) {
    const igId =
      typeof account.metadata?.igUserId === "string"
        ? account.metadata.igUserId
        : account.externalAccountId;
    const imageUrls = captionImageUrls(caption);
    if (imageUrls.length === 0) {
      throw new SocialPublishError(
        "INVALID_IMAGE",
        "Add social images or a featured https image before publishing to Instagram.",
      );
    }
    return withTransientRetry("Instagram", async () => {
      let creationId = "";

      if (imageUrls.length === 1) {
        const createBody = new URLSearchParams();
        createBody.set("image_url", imageUrls[0]);
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
        await waitForIgContainer(createdData.id, account.accessToken);
        creationId = createdData.id;
      } else {
        const children: string[] = [];
        for (const url of imageUrls) {
          const childBody = new URLSearchParams();
          childBody.set("image_url", url);
          childBody.set("is_carousel_item", "true");
          childBody.set("access_token", account.accessToken);
          const child = await socialFetch(`${GRAPH}/${igId}/media`, {
            method: "POST",
            body: childBody,
          });
          await expectOk(child, "Instagram");
          const childData = (await child.json()) as { id?: string };
          if (!childData.id) {
            throw new SocialPublishError(
              "INVALID_IMAGE",
              "Instagram did not accept a carousel image. Retry Instagram.",
            );
          }
          await waitForIgContainer(childData.id, account.accessToken);
          children.push(childData.id);
        }

        const carouselBody = new URLSearchParams();
        carouselBody.set("media_type", "CAROUSEL");
        carouselBody.set("children", children.join(","));
        carouselBody.set("caption", caption.caption);
        carouselBody.set("access_token", account.accessToken);
        const carousel = await socialFetch(`${GRAPH}/${igId}/media`, {
          method: "POST",
          body: carouselBody,
        });
        await expectOk(carousel, "Instagram");
        const carouselData = (await carousel.json()) as { id?: string };
        if (!carouselData.id) {
          throw new SocialPublishError(
            "PLATFORM_TEMPORARY",
            "Instagram did not create the carousel. Retry Instagram.",
          );
        }
        await waitForIgContainer(carouselData.id, account.accessToken);
        creationId = carouselData.id;
      }

      const publishBody = new URLSearchParams();
      publishBody.set("creation_id", creationId);
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
