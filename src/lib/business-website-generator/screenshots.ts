import { prisma } from "@/lib/prisma";
import { uploadImageBuffer } from "@/lib/upload-image-buffer";
import { encodeAssetMeta } from "@/lib/business-discovery/images/attribution";
import { signConceptPreviewToken } from "@/lib/business-website-generator/preview-token";
function thumUrl(pageUrl: string, device: "desktop" | "mobile") {
  const width = device === "mobile" ? 480 : 1400;
  const crop = device === "mobile" ? 1600 : 1200;
  return `https://image.thum.io/get/width/${width}/crop/${crop}/noanimate/${pageUrl}`;
}

function publicPreviewBase() {
  const raw = (process.env.NEXTAUTH_URL || "").trim().replace(/\/$/, "");
  if (!raw) return null;
  if (/localhost|127\.0\.0\.1/i.test(raw)) return null;
  return raw;
}

function publicPreviewUrl(conceptId: string) {
  const base = publicPreviewBase();
  if (!base) return null;
  const token = signConceptPreviewToken(conceptId);
  return `${base}/api/public/business-concepts/${encodeURIComponent(token)}`;
}

async function fetchShot(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { Accept: "image/*,*/*" },
  });
  if (!response.ok) return null;
  const mime = response.headers.get("content-type") || "";
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength < 1000) return null;
  return {
    buffer,
    mimeType: mime.includes("png") ? "image/png" : "image/jpeg",
  };
}

export async function captureConceptScreenshots(conceptId: string) {
  const concept = await prisma.businessWebsiteConcept.findUnique({
    where: { id: conceptId },
    select: {
      id: true,
      businessOpportunityId: true,
      conceptTitle: true,
    },
  });
  if (!concept) throw new Error("Concept not found.");

  const previewUrl = publicPreviewUrl(concept.id);
  if (!previewUrl) {
    // thum.io cannot reach localhost and must not screenshot techlyser.com by mistake.
    return {
      previewUrl: null,
      skipped:
        "Screenshot capture needs a public NEXTAUTH_URL (not localhost). PDF still uses the drawn business landing page.",
    };
  }

  const folder = `techlyser/business-opportunities/${concept.businessOpportunityId}/screenshots`;
  const results: { desktopUrl?: string; mobileUrl?: string } = {};

  for (const device of ["desktop", "mobile"] as const) {
    const shot = await fetchShot(thumUrl(previewUrl, device));
    if (!shot) continue;
    const uploaded = await uploadImageBuffer({
      buffer: shot.buffer,
      mimeType: shot.mimeType,
      baseName: `${device}-concept`,
      folder,
    });
    await prisma.businessOpportunityAsset.create({
      data: {
        businessOpportunityId: concept.businessOpportunityId,
        assetType: device === "desktop" ? "SCREENSHOT_DESKTOP" : "SCREENSHOT_MOBILE",
        assetUrl: uploaded.url,
        sourceUrl: previewUrl,
        usagePermission: "permitted",
        attribution: encodeAssetMeta({
          imageCategory: device === "desktop" ? "screenshot_desktop" : "screenshot_mobile",
          altText: `${concept.conceptTitle} ${device} screenshot`,
          provider: "thumio",
          isIllustrative: false,
          extra: "Rendered concept screenshot",
        }),
      },
    });
    if (device === "desktop") results.desktopUrl = uploaded.url;
    else results.mobileUrl = uploaded.url;
  }

  if (results.desktopUrl || results.mobileUrl) {
    await prisma.businessWebsiteConcept.update({
      where: { id: concept.id },
      data: {
        previewScreenshotUrl: results.desktopUrl || results.mobileUrl,
      },
    });
  }

  return { previewUrl, ...results };
}

export async function getConceptScreenshotAssets(businessOpportunityId: string) {
  const rows = await prisma.businessOpportunityAsset.findMany({
    where: {
      businessOpportunityId,
      assetType: { in: ["SCREENSHOT_DESKTOP", "SCREENSHOT_MOBILE"] },
    },
    orderBy: { createdAt: "desc" },
  });
  return {
    desktop: rows.find((r) => r.assetType === "SCREENSHOT_DESKTOP") || null,
    mobile: rows.find((r) => r.assetType === "SCREENSHOT_MOBILE") || null,
  };
}
