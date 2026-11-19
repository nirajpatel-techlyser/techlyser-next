import { City, State } from "country-state-city";
import type { OpportunityCity } from "@/lib/business-discovery/types";

const POPULAR_BY_COUNTRY: Record<string, string[]> = {
  IN: [
    "Mumbai",
    "Delhi",
    "Bengaluru",
    "Hyderabad",
    "Ahmedabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Jaipur",
    "Surat",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Bhopal",
    "Visakhapatnam",
    "Patna",
    "Vadodara",
    "Ghaziabad",
    "Ludhiana",
    "Agra",
    "Nashik",
    "Faridabad",
    "Meerut",
    "Rajkot",
    "Varanasi",
    "Srinagar",
    "Amritsar",
    "Chandigarh",
    "Coimbatore",
  ],
  US: [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose",
    "Austin",
    "Jacksonville",
    "Fort Worth",
    "Columbus",
    "Charlotte",
    "San Francisco",
    "Indianapolis",
    "Seattle",
    "Denver",
    "Boston",
    "Nashville",
    "Detroit",
    "Portland",
    "Las Vegas",
    "Miami",
    "Atlanta",
  ],
  GB: [
    "London",
    "Birmingham",
    "Manchester",
    "Glasgow",
    "Liverpool",
    "Leeds",
    "Sheffield",
    "Edinburgh",
    "Bristol",
    "Cardiff",
    "Belfast",
    "Leicester",
    "Coventry",
    "Nottingham",
    "Newcastle upon Tyne",
  ],
  CA: [
    "Toronto",
    "Montreal",
    "Vancouver",
    "Calgary",
    "Edmonton",
    "Ottawa",
    "Winnipeg",
    "Quebec City",
    "Hamilton",
    "Kitchener",
    "London",
    "Victoria",
    "Halifax",
    "Saskatoon",
  ],
  AU: [
    "Sydney",
    "Melbourne",
    "Brisbane",
    "Perth",
    "Adelaide",
    "Gold Coast",
    "Canberra",
    "Newcastle",
    "Wollongong",
    "Hobart",
    "Geelong",
    "Townsville",
    "Cairns",
    "Darwin",
  ],
  AE: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Al Ain"],
  DE: [
    "Berlin",
    "Hamburg",
    "Munich",
    "Cologne",
    "Frankfurt",
    "Stuttgart",
    "Düsseldorf",
    "Dortmund",
    "Essen",
    "Leipzig",
    "Bremen",
    "Dresden",
    "Hannover",
    "Nuremberg",
  ],
  FR: [
    "Paris",
    "Marseille",
    "Lyon",
    "Toulouse",
    "Nice",
    "Nantes",
    "Strasbourg",
    "Montpellier",
    "Bordeaux",
    "Lille",
    "Rennes",
    "Reims",
  ],
  SG: ["Singapore"],
  NZ: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Dunedin", "Palmerston North"],
};

function toCity(countryCode: string, name: string, stateCode?: string): OpportunityCity {
  return {
    id: `${countryCode}:${stateCode || "NA"}:${name}`.toLowerCase(),
    name,
    countryCode,
    stateCode,
  };
}

export function listPopularCities(countryCode: string): OpportunityCity[] {
  const names = POPULAR_BY_COUNTRY[countryCode] || [];
  return names.map((name) => toCity(countryCode, name));
}

/** Full searchable city list for a country (from country-state-city). */
export function listCitiesForCountry(countryCode: string): OpportunityCity[] {
  const cities = City.getCitiesOfCountry(countryCode) || [];
  return cities.map((c) =>
    toCity(countryCode, c.name, c.stateCode),
  );
}

export function searchCities(countryCode: string, query: string, limit = 40): OpportunityCity[] {
  const q = query.trim().toLowerCase();
  if (!q) return listPopularCities(countryCode).slice(0, limit);

  const popular = listPopularCities(countryCode).filter((c) =>
    c.name.toLowerCase().includes(q),
  );
  if (popular.length >= limit) return popular.slice(0, limit);

  const all = listCitiesForCountry(countryCode);
  const rest = all.filter(
    (c) =>
      c.name.toLowerCase().includes(q) &&
      !popular.some((p) => p.name.toLowerCase() === c.name.toLowerCase()),
  );
  return [...popular, ...rest].slice(0, limit);
}

export function listStates(countryCode: string) {
  return (State.getStatesOfCountry(countryCode) || []).map((s) => ({
    code: s.isoCode,
    name: s.name,
  }));
}

export function normalizeManualCity(countryCode: string, raw: string): OpportunityCity | null {
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 80) return null;
  return toCity(countryCode, name);
}
