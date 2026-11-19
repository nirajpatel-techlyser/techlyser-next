import type {
  BusinessDiscoveryHit,
  BusinessDiscoveryProvider,
  DiscoverBusinessesInput,
} from "@/lib/business-discovery/provider-interface";
import type { OpportunityCategory } from "@/lib/business-discovery/types";

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const DEFAULT_OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

function overpassEndpoints() {
  const custom = process.env.OVERPASS_API_URL?.trim();
  if (custom) return [custom, ...DEFAULT_OVERPASS_ENDPOINTS.filter((u) => u !== custom)];
  return DEFAULT_OVERPASS_ENDPOINTS;
}

function parseOsmTag(tag: string): { key: string; value: string } | null {
  const idx = tag.indexOf("=");
  if (idx <= 0) return null;
  return { key: tag.slice(0, idx), value: tag.slice(idx + 1) };
}

function buildQuery(
  input: DiscoverBusinessesInput,
  categories: OpportunityCategory[],
) {
  const radiusM = Math.min(100_000, Math.max(500, Math.round(input.radiusKm * 1000)));
  const clauses: string[] = [];
  for (const category of categories) {
    for (const osmTag of category.providerHints.osmTags || []) {
      const parsed = parseOsmTag(osmTag);
      if (!parsed) continue;
      const filter = `["${parsed.key}"="${parsed.value}"]`;
      clauses.push(
        `node${filter}(around:${radiusM},${input.latitude},${input.longitude});`,
      );
      clauses.push(
        `way${filter}(around:${radiusM},${input.latitude},${input.longitude});`,
      );
    }
  }
  if (clauses.length === 0) {
    throw new Error("Selected categories have no OpenStreetMap tag mapping.");
  }
  return `
[out:json][timeout:45];
(
  ${clauses.join("\n  ")}
);
out center tags ${Math.min(80, Math.max(input.limit * 3, input.limit))};
`.trim();
}

function normalizeWebsite(raw?: string | null) {
  if (!raw?.trim()) return null;
  const value = raw.trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[\w.-]+\.[a-z]{2,}/i.test(value)) return `https://${value}`;
  return null;
}

function pickEmail(tags: Record<string, string>) {
  return (
    tags.email ||
    tags["contact:email"] ||
    tags["contact:email_1"] ||
    null
  );
}

function pickPhone(tags: Record<string, string>) {
  return tags.phone || tags["contact:phone"] || tags["contact:mobile"] || null;
}

function categoryForTags(
  tags: Record<string, string>,
  categories: OpportunityCategory[],
) {
  for (const category of categories) {
    for (const osmTag of category.providerHints.osmTags || []) {
      const parsed = parseOsmTag(osmTag);
      if (!parsed) continue;
      if (tags[parsed.key] === parsed.value) return category;
    }
  }
  return categories[0] || null;
}

function passesWebsiteFilter(
  websiteUrl: string | null,
  filter: DiscoverBusinessesInput["websiteFilter"],
) {
  if (filter === "any") return true;
  if (filter === "no_website_listed") return !websiteUrl;
  if (filter === "unverified") return Boolean(websiteUrl);
  return true;
}

async function fetchOverpass(query: string) {
  const endpoints = overpassEndpoints();
  const errors: string[] = [];

  for (let i = 0; i < endpoints.length; i += 1) {
    const endpoint = endpoints[i];
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Accept: "application/json",
          "User-Agent":
            "TechlyserBusinessOpportunityFinder/1.0 (admin@techlyser.com)",
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(50000),
      });
      if (response.ok) return response;

      const status = response.status;
      errors.push(`${new URL(endpoint).hostname} → ${status}`);
      // Retry other mirrors on gateway / overload responses.
      if (![429, 502, 503, 504].includes(status)) {
        throw new Error(
          `OpenStreetMap Overpass returned ${status} (${new URL(endpoint).hostname}). No businesses were invented.`,
        );
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("returned")) throw err;
      const reason = err instanceof Error ? err.message : "request failed";
      errors.push(`${new URL(endpoint).hostname} → ${reason}`);
    }

    if (i < endpoints.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }

  throw new Error(
    `OpenStreetMap servers are busy or down (${errors.join("; ")}). Wait a minute and try again, or reduce radius/categories. No businesses were invented.`,
  );
}

async function discoverOverpass(
  input: DiscoverBusinessesInput,
): Promise<BusinessDiscoveryHit[]> {
  const query = buildQuery(input, input.categories);
  const response = await fetchOverpass(query);
  const data = (await response.json()) as { elements?: OverpassElement[] };
  const hits: BusinessDiscoveryHit[] = [];
  const seen = new Set<string>();

  for (const element of data.elements || []) {
    const tags = element.tags || {};
    const name = tags.name?.trim();
    if (!name) continue;
    const category = categoryForTags(tags, input.categories);
    if (!category) continue;

    const websiteUrl = normalizeWebsite(tags.website || tags["contact:website"]);
    if (!passesWebsiteFilter(websiteUrl, input.websiteFilter)) continue;

    const publicEmail = pickEmail(tags);
    const phone = pickPhone(tags);
    if (input.requireEmail && !publicEmail) continue;
    if (input.requirePhone && !phone) continue;

    const providerRecordId = `${element.type}/${element.id}`;
    if (seen.has(providerRecordId)) continue;
    seen.add(providerRecordId);

    const lat = element.lat ?? element.center?.lat ?? null;
    const lon = element.lon ?? element.center?.lon ?? null;
    const address = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:suburb"],
      tags["addr:city"] || input.city,
    ]
      .filter(Boolean)
      .join(" ");

    hits.push({
      provider: "openstreetmap",
      providerRecordId,
      businessName: name,
      categoryId: category.id,
      categoryLabel: category.label,
      categoryGroup: category.group,
      countryCode: input.countryCode,
      countryName: input.countryName,
      city: input.city,
      address: address || null,
      phone,
      publicEmail,
      websiteUrl,
      description: tags.description || tags.cuisine || null,
      sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      latitude: lat,
      longitude: lon,
      openingHours: tags.opening_hours || null,
      sourceMetadata: {
        osmType: element.type,
        osmId: element.id,
        attribution: "© OpenStreetMap contributors",
        tags,
      },
    });

    if (hits.length >= input.limit) break;
  }

  return hits;
}

export const overpassProvider: BusinessDiscoveryProvider = {
  id: "openstreetmap",
  label: "OpenStreetMap (Overpass)",
  configured: () => true,
  discover: discoverOverpass,
};
