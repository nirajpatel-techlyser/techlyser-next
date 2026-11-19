import { prisma } from "@/lib/prisma";
import { encodeAssetMeta, decodeAssetMeta } from "@/lib/business-discovery/images/attribution";
import { extractOsmImages } from "@/lib/business-discovery/images/extract-osm";
import { fetchAndStoreImage } from "@/lib/business-discovery/images/fetch-validate";
import { harvestOfficialSiteImages } from "@/lib/business-discovery/images/site-harvest";
import { searchUnsplashStock } from "@/lib/business-discovery/images/unsplash";
import type {
  DiscoveredImage,
  StoredBusinessAsset,
} from "@/lib/business-discovery/images/types";

function toStored(row: {
  id: string;
  assetUrl: string;
  sourceUrl: string | null;
  assetType: StoredBusinessAsset["assetType"];
  usagePermission: string;
  attribution: string | null;
}): StoredBusinessAsset {
  const meta = decodeAssetMeta(row.attribution);
  return {
    id: row.id,
    assetUrl: row.assetUrl,
    sourceUrl: row.sourceUrl,
    assetType: row.assetType,
    usagePermission: row.usagePermission,
    attribution: row.attribution,
    imageCategory: meta.imageCategory,
    isIllustrative: meta.isIllustrative,
    altText: meta.altText || "Business image",
  };
}

async function persistCandidates(
  businessOpportunityId: string,
  candidates: DiscoveredImage[],
) {
  const folder = `techlyser/business-opportunities/${businessOpportunityId}`;
  const stored: StoredBusinessAsset[] = [];

  for (const candidate of candidates) {
    const uploaded = await fetchAndStoreImage(candidate, folder);
    if (!uploaded) continue;

    const attribution = encodeAssetMeta({
      imageCategory: candidate.imageCategory,
      altText: candidate.altText,
      provider: candidate.provider,
      isIllustrative: candidate.isIllustrative,
      extra: candidate.attribution,
    });

    const row = await prisma.businessOpportunityAsset.create({
      data: {
        businessOpportunityId,
        assetType: candidate.assetType,
        assetUrl: uploaded.url,
        sourceUrl: candidate.sourceUrl,
        usagePermission: candidate.usagePermission,
        attribution,
      },
    });
    stored.push(toStored(row));
    if (stored.length >= 8) break;
  }

  return stored;
}

export async function listBusinessAssets(
  businessOpportunityId: string,
): Promise<StoredBusinessAsset[]> {
  const rows = await prisma.businessOpportunityAsset.findMany({
    where: {
      businessOpportunityId,
      assetType: { in: ["PHOTO", "LOGO", "OTHER"] },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toStored);
}

/** Discover + store permitted/illustrative images for a business lead. */
export async function collectBusinessImages(businessOpportunityId: string) {
  const business = await prisma.businessOpportunity.findUnique({
    where: { id: businessOpportunityId },
    select: {
      id: true,
      businessName: true,
      category: true,
      city: true,
      websiteUrl: true,
      sourceMetadata: true,
    },
  });
  if (!business) throw new Error("Business not found.");

  const existing = await listBusinessAssets(business.id);
  if (existing.length >= 4) return existing;

  const candidates: DiscoveredImage[] = [
    ...extractOsmImages({
      businessName: business.businessName,
      sourceMetadata: business.sourceMetadata,
    }),
    ...(await harvestOfficialSiteImages({
      websiteUrl: business.websiteUrl,
      businessName: business.businessName,
    })),
  ];

  let stored = await persistCandidates(business.id, candidates);

  if (stored.length + existing.length < 2) {
    const stock = await searchUnsplashStock({
      category: business.category,
      city: business.city,
      businessName: business.businessName,
      limit: 3,
    });
    stored = [...stored, ...(await persistCandidates(business.id, stock))];
  }

  return listBusinessAssets(business.id);
}
