import type { ImageCategory } from "@/lib/business-discovery/images/types";

/** Encode metadata into attribution string (schema has no JSON field on assets). */
export function encodeAssetMeta(input: {
  imageCategory: ImageCategory;
  altText: string;
  provider: string;
  isIllustrative: boolean;
  extra?: string;
}) {
  const parts = [
    `category=${input.imageCategory}`,
    `provider=${input.provider}`,
    `illustrative=${input.isIllustrative ? "1" : "0"}`,
    `alt=${input.altText.replace(/\|/g, " ").slice(0, 120)}`,
  ];
  if (input.extra) parts.push(`note=${input.extra.replace(/\|/g, " ").slice(0, 160)}`);
  return parts.join("|");
}

export function decodeAssetMeta(attribution: string | null | undefined) {
  const raw = attribution || "";
  const map = new Map<string, string>();
  for (const part of raw.split("|")) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    map.set(part.slice(0, idx), part.slice(idx + 1));
  }
  return {
    imageCategory: (map.get("category") || "other") as ImageCategory,
    provider: map.get("provider") || "other",
    isIllustrative: map.get("illustrative") === "1",
    altText: map.get("alt") || "",
    note: map.get("note") || "",
  };
}
