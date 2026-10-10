import { isPublicHttpsUrl } from "@/social/content";
import { SocialPublishError } from "@/social/errors";

const MAX_BYTES = 8 * 1024 * 1024;

export async function downloadImageOnce(url: string | null) {
  if (!isPublicHttpsUrl(url) || !url) return null;
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new SocialPublishError(
      "INVALID_IMAGE",
      "The featured image could not be downloaded. Upload a public https image.",
    );
  }
  const length = Number(response.headers.get("content-length") || "0");
  if (length > MAX_BYTES) {
    throw new SocialPublishError(
      "INVALID_IMAGE",
      "The featured image is too large. Use an image under 8 MB.",
    );
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > MAX_BYTES) {
    throw new SocialPublishError(
      "INVALID_IMAGE",
      "The featured image is too large. Use an image under 8 MB.",
    );
  }
  const mime = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  return { bytes, mime };
}
