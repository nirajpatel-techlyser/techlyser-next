import { assertPublicHttpUrl } from "@/leads/ssrf";
import { uploadImageBuffer } from "@/lib/upload-image-buffer";
import type { DiscoveredImage } from "@/lib/business-discovery/images/types";

const MAX_BYTES = 8 * 1024 * 1024;

export async function fetchAndStoreImage(
  image: DiscoveredImage,
  folder: string,
): Promise<{ url: string; mimeType: string } | null> {
  try {
    const safe = await assertPublicHttpUrl(image.sourceUrl);
    const response = await fetch(safe.toString(), {
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
      headers: {
        Accept: "image/*,*/*",
        "User-Agent": "TechlyserBusinessOpportunityFinder/1.0 (admin@techlyser.com)",
      },
    });
    if (!response.ok) return null;
    const mime = response.headers.get("content-type") || "";
    if (!mime.startsWith("image/")) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength < 800 || buffer.byteLength > MAX_BYTES) return null;

    const uploaded = await uploadImageBuffer({
      buffer,
      mimeType: mime.includes("png")
        ? "image/png"
        : mime.includes("webp")
          ? "image/png"
          : "image/jpeg",
      baseName: image.imageCategory,
      folder,
    });
    return { url: uploaded.url, mimeType: mime };
  } catch {
    return null;
  }
}
