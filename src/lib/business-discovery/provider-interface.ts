import type { OpportunityCategory } from "@/lib/business-discovery/types";

export type BusinessDiscoveryHit = {
  provider: string;
  providerRecordId: string;
  businessName: string;
  categoryId: string;
  categoryLabel: string;
  categoryGroup?: string;
  countryCode: string;
  countryName: string;
  city: string;
  address?: string | null;
  phone?: string | null;
  publicEmail?: string | null;
  websiteUrl?: string | null;
  description?: string | null;
  sourceUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  openingHours?: unknown;
  sourceMetadata?: Record<string, unknown>;
};

export type DiscoverBusinessesInput = {
  countryCode: string;
  countryName: string;
  city: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  categories: OpportunityCategory[];
  limit: number;
  websiteFilter: "any" | "no_website_listed" | "unverified";
  requireEmail: boolean;
  requirePhone: boolean;
};

export type BusinessDiscoveryProvider = {
  id: string;
  label: string;
  configured: () => boolean;
  discover: (input: DiscoverBusinessesInput) => Promise<BusinessDiscoveryHit[]>;
};
