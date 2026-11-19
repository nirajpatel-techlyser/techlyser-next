import type { DiscoveredImage } from "@/lib/business-discovery/images/types";

function asTags(sourceMetadata: unknown): Record<string, string> {
  if (!sourceMetadata || typeof sourceMetadata !== "object") return {};
  const record = sourceMetadata as Record<string, unknown>;
  const tags = record.tags;
  if (!tags || typeof tags !== "object" || Array.isArray(tags)) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(tags as Record<string, unknown>)) {
    if (typeof value === "string" && value.trim()) out[key] = value.trim();
  }
  return out;
}

function wikimediaFileUrl(raw: string) {
  const name = raw.replace(/^File:/i, "").trim();
  if (!name) return null;
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}`;
}

function normalizeHttpUrl(raw: string) {
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^\/\//.test(raw)) return `https:${raw}`;
  return null;
}

/** Pull candidate image URLs from OSM tags already stored on the lead. */
export function extractOsmImages(input: {
  businessName: string;
  sourceMetadata: unknown;
}): DiscoveredImage[] {
  const tags = asTags(input.sourceMetadata);
  const hits: DiscoveredImage[] = [];
  const seen = new Set<string>();

  const push = (raw: string | undefined, kind: DiscoveredImage["imageCategory"], provider: DiscoveredImage["provider"], note: string) => {
    if (!raw) return;
    let url = normalizeHttpUrl(raw);
    if (!url && raw.toLowerCase().includes("file:")) {
      url = wikimediaFileUrl(raw);
    }
    if (!url || seen.has(url)) return;
    seen.add(url);
    hits.push({
      sourceUrl: url,
      assetType: kind === "logo" ? "LOGO" : "PHOTO",
      imageCategory: kind,
      usagePermission: provider === "wikimedia" ? "permitted" : "unknown",
      attribution: note,
      altText: `${input.businessName} ${kind}`,
      provider,
      isIllustrative: false,
    });
  };

  push(tags.image, "gallery", "openstreetmap", "OSM image tag — verify reuse for commercial display");
  push(tags["image:0"], "gallery", "openstreetmap", "OSM image:0 tag");
  push(tags.logo, "logo", "openstreetmap", "OSM logo tag");
  push(tags["brand:wikipedia"], "logo", "wikimedia", "OSM brand:wikipedia");
  if (tags.wikimedia_commons) {
    const url = wikimediaFileUrl(tags.wikimedia_commons);
    push(url || undefined, "gallery", "wikimedia", "© Wikimedia Commons / OSM wikimedia_commons — attribution required");
  }

  return hits.slice(0, 8);
}
