import { City } from "country-state-city";

export type CityCoordinates = {
  latitude: number;
  longitude: number;
  source: "dataset" | "nominatim";
  matchedName: string;
};

function parseCoord(value: string | undefined | null) {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Resolve city lat/lon from country-state-city, then Nominatim as fallback. */
export async function resolveCityCoordinates(
  countryCode: string,
  cityName: string,
): Promise<CityCoordinates | null> {
  const needle = cityName.trim().toLowerCase();
  if (!needle) return null;

  const cities = City.getCitiesOfCountry(countryCode) || [];
  const exact = cities.find((c) => c.name.toLowerCase() === needle);
  const partial =
    exact ||
    cities.find((c) => c.name.toLowerCase().includes(needle) || needle.includes(c.name.toLowerCase()));
  if (partial) {
    const latitude = parseCoord(partial.latitude);
    const longitude = parseCoord(partial.longitude);
    if (latitude != null && longitude != null) {
      return {
        latitude,
        longitude,
        source: "dataset",
        matchedName: partial.name,
      };
    }
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("city", cityName);
  url.searchParams.set("countrycodes", countryCode.toLowerCase());
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "TechlyserBusinessOpportunityFinder/1.0 (admin@techlyser.com)",
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { lat?: string; lon?: string; display_name?: string }[];
  const hit = data[0];
  if (!hit?.lat || !hit?.lon) return null;
  return {
    latitude: Number(hit.lat),
    longitude: Number(hit.lon),
    source: "nominatim",
    matchedName: hit.display_name || cityName,
  };
}
