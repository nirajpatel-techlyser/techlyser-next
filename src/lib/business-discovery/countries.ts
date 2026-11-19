import { Country } from "country-state-city";
import type { OpportunityCountry } from "@/lib/business-discovery/types";

/** Priority countries for Techlyser outreach (still searchable across full ISO list). */
export const PRIORITY_COUNTRY_CODES = [
  "IN",
  "US",
  "GB",
  "CA",
  "AU",
  "AE",
  "DE",
  "FR",
  "SG",
  "NZ",
] as const;

export function listOpportunityCountries(): OpportunityCountry[] {
  return Country.getAllCountries()
    .map((c) => ({ code: c.isoCode, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listPriorityCountries(): OpportunityCountry[] {
  const all = listOpportunityCountries();
  const byCode = new Map(all.map((c) => [c.code, c]));
  return PRIORITY_COUNTRY_CODES.map((code) => byCode.get(code)).filter(
    (c): c is OpportunityCountry => Boolean(c),
  );
}

export function getCountryName(code: string) {
  return Country.getCountryByCode(code)?.name || code;
}

export function isValidCountryCode(code: string) {
  return Boolean(Country.getCountryByCode(code));
}
