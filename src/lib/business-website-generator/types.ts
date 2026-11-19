import type { StoredBusinessAsset } from "@/lib/business-discovery/images/types";

export type DesignFamily =
  | "restaurant"
  | "clinic"
  | "salon"
  | "retail"
  | "fitness"
  | "professional"
  | "home_services"
  | "default";

export type DesignTokens = {
  family: DesignFamily;
  label: string;
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  accentSoft: string;
  heroGradient: string;
  fontDisplay: string;
  fontBody: string;
  radius: string;
};

export type ConceptCopy = {
  conceptTitle: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroSubhead: string;
  primaryCta: string;
  aboutTitle: string;
  aboutBody: string;
  servicesTitle: string;
  serviceItems: Array<{ title: string; body: string }>;
  galleryTitle: string;
  contactTitle: string;
  contactBody: string;
  footerNote: string;
  designNotes: string;
};

export type ConceptBusiness = {
  id: string;
  businessName: string;
  /** English-friendly name for page copy (name:en / Latin), falls back to businessName. */
  displayName: string;
  category: string;
  categoryGroup: string | null;
  city: string;
  countryName: string;
  address: string | null;
  phone: string | null;
  publicEmail: string | null;
  websiteUrl: string | null;
  description: string | null;
  openingHours: unknown;
  /** Verified degree/title from listing tags when present. */
  degree: string | null;
  /** Verified specialty from listing tags when present. */
  specialty: string | null;
  assets: StoredBusinessAsset[];
};

export type AssembledConcept = {
  conceptTitle: string;
  html: string;
  content: ConceptCopy & {
    family: DesignFamily;
    usedSections: string[];
    imageNotes: string[];
  };
};
