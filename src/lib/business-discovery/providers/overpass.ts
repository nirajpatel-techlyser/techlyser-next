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

type NominatimSearchHit = {
  osm_type?: string;
  osm_id?: number;
  lat?: string;
  lon?: string;
  display_name?: string;
  name?: string;
  type?: string;
  class?: string;
  extratags?: Record<string, string> | null;
  address?: Record<string, string>;
};

const DEFAULT_OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

function overpassEndpoints() {
  const custom = process.env.OVERPASS_API_URL?.trim();
  if (custom) {
    return [custom, ...DEFAULT_OVERPASS_ENDPOINTS.filter((u) => u !== custom)];
  }
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
  const radiusM = Math.min(
    100_000,
    Math.max(500, Math.round(input.radiusKm * 1000)),
  );
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
[out:json][timeout:15];
(
  ${clauses.join("\n  ")}
);
out center tags ${Math.min(60, Math.max(input.limit * 2, input.limit))};
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

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function fetchOverpass(query: string) {
  const endpoints = overpassEndpoints().slice(0, 4);
  const perAttemptMs = 14000;
  const errors: string[] = [];

  // Race mirrors — first OK JSON wins (Overpass is often capacity-limited).
  const controllers = endpoints.map(() => new AbortController());
  const timer = setTimeout(() => {
    for (const c of controllers) c.abort();
  }, perAttemptMs);

  try {
    const result = await Promise.any(
      endpoints.map(async (endpoint, index) => {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded;charset=UTF-8",
              Accept: "application/json",
              "User-Agent":
                "TechlyserBusinessOpportunityFinder/1.0 (admin@techlyser.com)",
            },
            body: `data=${encodeURIComponent(query)}`,
            signal: controllers[index].signal,
          });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const data = (await response.json()) as {
            elements?: OverpassElement[];
          };
          if (!Array.isArray(data.elements)) {
            throw new Error("invalid JSON payload");
          }
          // Cancel siblings
          for (let i = 0; i < controllers.length; i += 1) {
            if (i !== index) controllers[i].abort();
          }
          return data;
        } catch (err) {
          const reason = err instanceof Error ? err.message : "failed";
          errors.push(`${new URL(endpoint).hostname} → ${reason}`);
          throw err;
        }
      }),
    );
    return result;
  } catch {
    throw new Error(
      `Overpass busy/timeout (${errors.slice(0, 4).join("; ") || "no response"}).`,
    );
  } finally {
    clearTimeout(timer);
  }
}

function mapOverpassHits(
  elements: OverpassElement[],
  input: DiscoverBusinessesInput,
): BusinessDiscoveryHit[] {
  const hits: BusinessDiscoveryHit[] = [];
  const seen = new Set<string>();

  for (const element of elements) {
    const tags = element.tags || {};
    const name = tags.name?.trim();
    if (!name) continue;
    const category = categoryForTags(tags, input.categories);
    if (!category) continue;

    const websiteUrl = normalizeWebsite(
      tags.website || tags["contact:website"],
    );
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
        via: "overpass",
      },
    });

    if (hits.length >= input.limit) break;
  }

  return hits;
}

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    osm_type?: string;
    osm_id?: number;
    osm_key?: string;
    osm_value?: string;
    street?: string;
    city?: string;
    county?: string;
    district?: string;
    state?: string;
    countrycode?: string;
    phone?: string;
    website?: string;
    email?: string;
  };
};

function categoryForOsmKeyValue(
  key: string | undefined,
  value: string | undefined,
  categories: OpportunityCategory[],
) {
  if (!key || !value) return categories[0] || null;
  for (const category of categories) {
    for (const osmTag of category.providerHints.osmTags || []) {
      const parsed = parseOsmTag(osmTag);
      if (!parsed) continue;
      if (parsed.key === key && parsed.value === value) return category;
    }
  }
  return categories[0] || null;
}

function pushHit(
  hits: BusinessDiscoveryHit[],
  seen: Set<string>,
  input: DiscoverBusinessesInput,
  hit: BusinessDiscoveryHit,
  websiteFilter: DiscoverBusinessesInput["websiteFilter"],
) {
  if (hits.length >= input.limit) return;
  if (seen.has(hit.providerRecordId)) return;
  if (!passesWebsiteFilter(hit.websiteUrl, websiteFilter)) return;
  if (input.requireEmail && !hit.publicEmail) return;
  if (input.requirePhone && !hit.phone) return;
  seen.add(hit.providerRecordId);
  hits.push(hit);
}

/** Photon (Komoot) — usually up when Overpass mirrors are overloaded. */
async function discoverViaPhoton(
  input: DiscoverBusinessesInput,
  websiteFilter: DiscoverBusinessesInput["websiteFilter"],
): Promise<BusinessDiscoveryHit[]> {
  const hits: BusinessDiscoveryHit[] = [];
  const seen = new Set<string>();
  const maxRadius = Math.max(input.radiusKm, 8) * 2.5;

  for (const category of input.categories) {
    if (hits.length >= input.limit) break;
    const osmHint = category.providerHints.osmTags?.[0];
    const parsed = osmHint ? parseOsmTag(osmHint) : null;
    const query = parsed?.value
      ? `${parsed.value} ${input.city}`
      : `${category.label} ${input.city}`;

    const url = new URL("https://photon.komoot.io/api/");
    url.searchParams.set("q", query);
    url.searchParams.set("lat", String(input.latitude));
    url.searchParams.set("lon", String(input.longitude));
    url.searchParams.set("limit", String(Math.min(25, input.limit * 3)));
    url.searchParams.set("lang", "en");

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) {
      throw new Error(`Photon returned HTTP ${response.status}`);
    }

    const data = (await response.json()) as { features?: PhotonFeature[] };
    for (const feature of data.features || []) {
      const props = feature.properties || {};
      const coords = feature.geometry?.coordinates;
      if (!props.name?.trim() || !props || coords.length < 2) continue;
      if (
        props.countrycode &&
        props.countrycode.toUpperCase() !== input.countryCode.toUpperCase()
      ) {
        continue;
      }

      const lon = coords[0];
      const lat = coords[1];
      if (
        haversineKm(input.latitude, input.longitude, lat, lon) > maxRadius
      ) {
        continue;
      }

      const matchedCategory =
        categoryForOsmKeyValue(
          props.osm_key,
          props.osm_value,
          input.categories,
        ) || category;
      if (!matchedCategory) continue;

      const osmTypeRaw = (props.osm_type || "N").toUpperCase();
      const osmType =
        osmTypeRaw === "W" ? "way" : osmTypeRaw === "R" ? "relation" : "node";
      const osmId = props.osm_id;
      if (!osmId) continue;

      const tags: Record<string, string> = {};
      if (props.osm_key && props.osm_value) {
        tags[props.osm_key] = props.osm_value;
      }
      if (props.phone) tags.phone = props.phone;
      if (props.website) tags.website = props.website;
      if (props.email) tags.email = props.email;

      pushHit(hits, seen, input, {
        provider: "openstreetmap",
        providerRecordId: `${osmType}/${osmId}`,
        businessName: props.name.trim(),
        categoryId: matchedCategory.id,
        categoryLabel: matchedCategory.label,
        categoryGroup: matchedCategory.group,
        countryCode: input.countryCode,
        countryName: input.countryName,
        city: input.city,
        address:
          [props.street, props.district, props.city || props.county, props.state]
            .filter(Boolean)
            .join(", ") || null,
        phone: pickPhone(tags),
        publicEmail: pickEmail(tags),
        websiteUrl: normalizeWebsite(tags.website),
        description: null,
        sourceUrl: `https://www.openstreetmap.org/${osmType}/${osmId}`,
        latitude: lat,
        longitude: lon,
        openingHours: null,
        sourceMetadata: {
          osmType,
          osmId,
          attribution: "© OpenStreetMap contributors (Photon)",
          tags,
          via: "photon-fallback",
        },
      }, websiteFilter);
    }
  }

  return hits;
}

/**
 * Nominatim search + extratags (phone/website when tagged).
 * Rate-limit friendly (sequential, ~1 req/category).
 */
async function discoverViaNominatim(
  input: DiscoverBusinessesInput,
  websiteFilter: DiscoverBusinessesInput["websiteFilter"],
): Promise<BusinessDiscoveryHit[]> {
  const hits: BusinessDiscoveryHit[] = [];
  const seen = new Set<string>();
  const maxRadius = Math.max(input.radiusKm, 8) * 3;
  const delta = Math.max(input.radiusKm, 8) / 111;

  for (const category of input.categories) {
    if (hits.length >= input.limit) break;

    const queries = [
      `${category.label} near ${input.city}`,
      `${category.label} ${input.city} ${input.countryName}`,
    ];

    for (const q of queries) {
      if (hits.length >= input.limit) break;

      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", q);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("extratags", "1");
      url.searchParams.set("limit", String(Math.min(25, input.limit * 3)));
      url.searchParams.set("countrycodes", input.countryCode.toLowerCase());
      url.searchParams.set(
        "viewbox",
        [
          input.longitude - delta * 1.4,
          input.latitude + delta,
          input.longitude + delta * 1.4,
          input.latitude - delta,
        ].join(","),
      );

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "TechlyserBusinessOpportunityFinder/1.0 (admin@techlyser.com)",
        },
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) {
        throw new Error(`Nominatim returned HTTP ${response.status}`);
      }

      const rows = (await response.json()) as NominatimSearchHit[];
      for (const row of rows) {
        if (hits.length >= input.limit) break;
        if (!row.osm_type || !row.osm_id || !row.lat || !row.lon) continue;

        const lat = Number(row.lat);
        const lon = Number(row.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
        if (
          haversineKm(input.latitude, input.longitude, lat, lon) > maxRadius
        ) {
          continue;
        }

        const tags = row.extratags || {};
        const name =
          row.name?.trim() ||
          row.display_name?.split(",")[0]?.trim() ||
          null;
        if (!name) continue;

        const osmType =
          row.osm_type === "node"
            ? "node"
            : row.osm_type === "way"
              ? "way"
              : "relation";

        pushHit(hits, seen, input, {
          provider: "openstreetmap",
          providerRecordId: `${osmType}/${row.osm_id}`,
          businessName: name,
          categoryId: category.id,
          categoryLabel: category.label,
          categoryGroup: category.group,
          countryCode: input.countryCode,
          countryName: input.countryName,
          city: input.city,
          address:
            [
              row.address?.house_number,
              row.address?.road,
              row.address?.suburb,
              row.address?.city || row.address?.town || input.city,
            ]
              .filter(Boolean)
              .join(" ") ||
            row.display_name ||
            null,
          phone: pickPhone(tags),
          publicEmail: pickEmail(tags),
          websiteUrl: normalizeWebsite(
            tags.website || tags["contact:website"],
          ),
          description: tags.cuisine || tags.description || null,
          sourceUrl: `https://www.openstreetmap.org/${osmType}/${row.osm_id}`,
          latitude: lat,
          longitude: lon,
          openingHours: tags.opening_hours || null,
          sourceMetadata: {
            osmType,
            osmId: row.osm_id,
            attribution: "© OpenStreetMap contributors (Nominatim)",
            tags,
            via: "nominatim-fallback",
          },
        }, websiteFilter);
      }

      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }

  return hits;
}

async function runFallbacks(
  input: DiscoverBusinessesInput,
): Promise<{ hits: BusinessDiscoveryHit[]; notes: string[] }> {
  const notes: string[] = [];
  // Prefer looser website filter on fallback so Discover still returns leads
  // when Overpass is down (many OSM rows lack website tags either way).
  const filtersToTry: Array<DiscoverBusinessesInput["websiteFilter"]> = [
    input.websiteFilter,
  ];
  if (input.websiteFilter !== "any") filtersToTry.push("any");

  for (const websiteFilter of filtersToTry) {
    try {
      const photonHits = await discoverViaPhoton(input, websiteFilter);
      if (photonHits.length > 0) {
        if (websiteFilter !== input.websiteFilter) {
          notes.push("Used website filter Any on Photon fallback.");
        }
        return { hits: photonHits, notes };
      }
      notes.push("Photon returned 0 matches.");
    } catch (err) {
      notes.push(
        `Photon: ${err instanceof Error ? err.message : "failed"}`,
      );
    }

    try {
      const nominatimHits = await discoverViaNominatim(input, websiteFilter);
      if (nominatimHits.length > 0) {
        if (websiteFilter !== input.websiteFilter) {
          notes.push("Used website filter Any on Nominatim fallback.");
        }
        return { hits: nominatimHits, notes };
      }
      notes.push("Nominatim returned 0 matches.");
    } catch (err) {
      notes.push(
        `Nominatim: ${err instanceof Error ? err.message : "failed"}`,
      );
    }
  }

  return { hits: [], notes };
}

async function discoverOverpass(
  input: DiscoverBusinessesInput,
): Promise<BusinessDiscoveryHit[]> {
  const query = buildQuery(input, input.categories);
  let overpassError: string | null = null;

  try {
    const data = await fetchOverpass(query);
    const hits = mapOverpassHits(data.elements || [], input);
    if (hits.length > 0) return hits;
  } catch (err) {
    overpassError = err instanceof Error ? err.message : "Overpass failed";
  }

  const { hits, notes } = await runFallbacks(input);
  if (hits.length > 0) return hits;

  const hint =
    "Try 1 city + 1 category, radius 10–25 km, website filter = Any, phone unchecked.";
  if (overpassError) {
    throw new Error(
      `${overpassError} Fallbacks also found 0 matches (${notes.join(" · ") || "none"}). ${hint}`,
    );
  }
  return [];
}

export const overpassProvider: BusinessDiscoveryProvider = {
  id: "openstreetmap",
  label: "OpenStreetMap (Overpass)",
  configured: () => true,
  discover: discoverOverpass,
};
