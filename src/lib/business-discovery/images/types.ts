import type { BizAssetType } from "@prisma/client";

export type ImageCategory =
  | "exterior"
  | "interior"
  | "product"
  | "food"
  | "service"
  | "storefront"
  | "facility"
  | "logo"
  | "gallery"
  | "stock"
  | "screenshot_desktop"
  | "screenshot_mobile"
  | "other";

export type DiscoveredImage = {
  sourceUrl: string;
  assetType: BizAssetType;
  imageCategory: ImageCategory;
  usagePermission: "permitted" | "stock_illustrative" | "unknown";
  attribution: string;
  altText: string;
  provider: "openstreetmap" | "wikimedia" | "official_website" | "unsplash" | "thumio" | "other";
  isIllustrative: boolean;
};

export type StoredBusinessAsset = {
  id: string;
  assetUrl: string;
  sourceUrl: string | null;
  assetType: BizAssetType;
  usagePermission: string;
  attribution: string | null;
  imageCategory: ImageCategory;
  isIllustrative: boolean;
  altText: string;
};
