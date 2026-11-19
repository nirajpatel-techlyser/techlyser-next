import type { DesignFamily, DesignTokens } from "@/lib/business-website-generator/types";

const SYSTEMS: Record<DesignFamily, DesignTokens> = {
  restaurant: {
    family: "restaurant",
    label: "Restaurant",
    bg: "#f7f1ea",
    surface: "#ffffff",
    ink: "#1c1410",
    muted: "#6d5c50",
    accent: "#c45c26",
    accentSoft: "#f3d9c8",
    heroGradient: "linear-gradient(135deg,#1c1410 0%,#3a2418 55%,#5a3420 100%)",
    fontDisplay: "Georgia, 'Times New Roman', serif",
    fontBody: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    radius: "18px",
  },
  clinic: {
    family: "clinic",
    label: "Healthcare",
    bg: "#f4f8fb",
    surface: "#ffffff",
    ink: "#122033",
    muted: "#5b6b7c",
    accent: "#1f6f8b",
    accentSoft: "#d7ebf2",
    heroGradient: "linear-gradient(135deg,#0f2a3a 0%,#1f4d63 60%,#2f6f86 100%)",
    fontDisplay: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    fontBody: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    radius: "14px",
  },
  salon: {
    family: "salon",
    label: "Salon",
    bg: "#111214",
    surface: "#1a1c20",
    ink: "#f4f1ea",
    muted: "#a8a29a",
    accent: "#d4a373",
    accentSoft: "#2a241c",
    heroGradient: "linear-gradient(145deg,#0b0b0c 0%,#1c1a17 50%,#2b241c 100%)",
    fontDisplay: "Georgia, 'Times New Roman', serif",
    fontBody: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    radius: "16px",
  },
  retail: {
    family: "retail",
    label: "Retail",
    bg: "#f3f5f8",
    surface: "#ffffff",
    ink: "#14171c",
    muted: "#5b6470",
    accent: "#e4572e",
    accentSoft: "#ffe3d8",
    heroGradient: "linear-gradient(120deg,#14171c 0%,#243041 100%)",
    fontDisplay: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    fontBody: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    radius: "16px",
  },
  fitness: {
    family: "fitness",
    label: "Fitness",
    bg: "#0f1115",
    surface: "#171a21",
    ink: "#f5f7fa",
    muted: "#9aa3b2",
    accent: "#39ff14",
    accentSoft: "#1d2a1a",
    heroGradient: "linear-gradient(160deg,#0a0b0e 0%,#151922 70%,#1d2430 100%)",
    fontDisplay: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    fontBody: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    radius: "12px",
  },
  professional: {
    family: "professional",
    label: "Professional",
    bg: "#f6f7f9",
    surface: "#ffffff",
    ink: "#101828",
    muted: "#667085",
    accent: "#175cd3",
    accentSoft: "#d1e0ff",
    heroGradient: "linear-gradient(135deg,#0b1f3a 0%,#163a66 100%)",
    fontDisplay: "Georgia, 'Times New Roman', serif",
    fontBody: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    radius: "12px",
  },
  home_services: {
    family: "home_services",
    label: "Home services",
    bg: "#f5f7f4",
    surface: "#ffffff",
    ink: "#1a2118",
    muted: "#5f6b5a",
    accent: "#2f6b3a",
    accentSoft: "#dcead9",
    heroGradient: "linear-gradient(135deg,#1a2118 0%,#2f4030 100%)",
    fontDisplay: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    fontBody: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    radius: "14px",
  },
  default: {
    family: "default",
    label: "Business",
    bg: "#f4f6f8",
    surface: "#ffffff",
    ink: "#14171c",
    muted: "#5b6470",
    accent: "#f2731f",
    accentSoft: "#ffe8d6",
    heroGradient: "linear-gradient(135deg,#101218 0%,#1c2430 55%,#243041 100%)",
    fontDisplay: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    fontBody: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    radius: "16px",
  },
};

export function resolveDesignFamily(
  category: string,
  categoryGroup?: string | null,
): DesignFamily {
  const hay = `${category} ${categoryGroup || ""}`.toLowerCase();
  // Order matters: salon/barber before food "bar", healthcare before generic "home", etc.
  if (/\b(salons?|barbers?|spas?|beauty|nails?)\b/.test(hay)) return "salon";
  if (
    /\b(doctors?|clinics?|dentists?|hospitals?|physio|pharmac(?:y|ies)|healthcare)\b/.test(
      hay,
    )
  ) {
    return "clinic";
  }
  if (/\b(gyms?|yoga|fitness|sports?|dance)\b/.test(hay)) return "fitness";
  if (
    /\b(lawyers?|accountants?|consultants?|architects?|marketing)\b/.test(hay) ||
    /real estate|professional services/.test(hay)
  ) {
    return "professional";
  }
  if (
    /home services|\b(plumbers?|electricians?|pest|construction)\b/.test(hay)
  ) {
    return "home_services";
  }
  if (
    /\b(grocery|retail|clothing|electronics|toys?|furniture|pet|hardware|bookstores?|supermarkets?)\b/.test(
      hay,
    ) ||
    /\b(shops?|stores?)\b/.test(hay)
  ) {
    return "retail";
  }
  if (
    /\b(restaurants?|cafes?|baker(?:y|ies)|bars?|food|catering)\b/.test(hay) ||
    /hospitality/.test(hay)
  ) {
    return "restaurant";
  }
  return "default";
}

export function getDesignTokens(
  category: string,
  categoryGroup?: string | null,
): DesignTokens {
  return SYSTEMS[resolveDesignFamily(category, categoryGroup)];
}
