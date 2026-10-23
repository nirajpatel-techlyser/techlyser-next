export const LEAD_MARKETS = [
  { id: "US", label: "United States" },
  { id: "CA", label: "Canada" },
  { id: "AU", label: "Australia" },
  { id: "NZ", label: "New Zealand" },
  { id: "DK", label: "Denmark" },
  { id: "EUROPE", label: "Europe" },
] as const;

export type LeadMarketId = (typeof LEAD_MARKETS)[number]["id"];

const EUROPE_CODES = new Set([
  "GB", "IE", "DE", "FR", "NL", "BE", "SE", "NO", "FI", "DK",
  "ES", "IT", "AT", "CH", "PT", "PL", "CZ", "GR", "HU", "RO",
]);

export function isLeadMarket(value: string): value is LeadMarketId {
  return LEAD_MARKETS.some((market) => market.id === value);
}

export function marketLabel(id: string) {
  return LEAD_MARKETS.find((market) => market.id === id)?.label || id;
}

export function countryMatchesMarket(countryCode: string | null | undefined, market: string) {
  if (!countryCode) return false;
  const code = countryCode.toUpperCase();
  if (market === "EUROPE") return EUROPE_CODES.has(code);
  return code === market;
}
