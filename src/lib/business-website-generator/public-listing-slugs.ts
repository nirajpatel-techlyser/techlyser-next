import { OPPORTUNITY_CATEGORIES } from "@/lib/business-discovery/categories";

/** Marketing URL slug (often singular) from category id. */
export const CATEGORY_ID_TO_SLUG: Record<string, string> = {
  restaurants: "restaurant",
  cafes: "cafe",
  bakeries: "bakery",
  bars: "bar",
  "fast-food": "fast-food",
  "food-shops": "food-shop",
  catering: "catering",
  doctors: "doctor",
  dentists: "dentist",
  clinics: "clinic",
  hospitals: "hospital",
  physiotherapists: "physiotherapist",
  pharmacies: "pharmacy",
  "diagnostic-centers": "diagnostic-center",
  barbers: "barber",
  "hair-salons": "hair-salon",
  "beauty-salons": "beauty-salon",
  spas: "spa",
  "nail-studios": "nail-studio",
  "grocery-stores": "grocery-store",
  supermarkets: "supermarket",
  "toy-shops": "toy-shop",
  "clothing-stores": "clothing-store",
  "shoe-stores": "shoe-store",
  "electronics-shops": "electronics-shop",
  "furniture-stores": "furniture-store",
  "gift-shops": "gift-shop",
  "pet-shops": "pet-shop",
  "hardware-stores": "hardware-store",
  bookstores: "bookstore",
  lawyers: "lawyer",
  accountants: "accountant",
  consultants: "consultant",
  architects: "architect",
  "real-estate": "real-estate",
  "marketing-agencies": "marketing-agency",
  gyms: "gym",
  "yoga-studios": "yoga-studio",
  "sports-academies": "sports-academy",
  "dance-studios": "dance-studio",
  "car-repair": "car-repair",
  "auto-dealers": "auto-dealer",
  "bike-repair": "bike-repair",
  "car-washes": "car-wash",
  schools: "school",
  "coaching-centers": "coaching-center",
  "training-institutes": "training-institute",
  tutors: "tutor",
  plumbers: "plumber",
  electricians: "electrician",
  "interior-designers": "interior-designer",
  "cleaning-services": "cleaning-service",
  "pest-control": "pest-control",
  construction: "construction",
};

const SLUG_TO_CATEGORY_ID = new Map(
  Object.entries(CATEGORY_ID_TO_SLUG).map(([id, slug]) => [slug, id]),
);

const LABEL_TO_CATEGORY_ID = new Map(
  OPPORTUNITY_CATEGORIES.map((c) => [c.label.toLowerCase(), c.id]),
);

/** Reserved first path segments that must never be treated as category slugs. */
export const RESERVED_PUBLIC_PATHS = new Set([
  "about",
  "admin",
  "api",
  "blog",
  "category",
  "contact",
  "free-shopify-audit",
  "portfolio",
  "resources",
  "services",
  "shopify-developers",
  "shopify-developers-india",
  "tag",
  "templates",
  "website-growth-audit",
]);

export function resolveCategoryIdFromLabelOrId(category: string): string | null {
  const raw = category.trim().toLowerCase();
  if (!raw) return null;
  if (CATEGORY_ID_TO_SLUG[raw]) return raw;
  return LABEL_TO_CATEGORY_ID.get(raw) || null;
}

export function categoryIdToPublicSlug(categoryId: string): string | null {
  return CATEGORY_ID_TO_SLUG[categoryId] || null;
}

export function publicSlugToCategoryId(slug: string): string | null {
  const s = slug.trim().toLowerCase();
  if (!s || RESERVED_PUBLIC_PATHS.has(s)) return null;
  return SLUG_TO_CATEGORY_ID.get(s) || null;
}

export function isKnownPublicCategorySlug(slug: string): boolean {
  return publicSlugToCategoryId(slug) !== null;
}

/** Template filename stem under public/templates/business-landing/ */
export function categoryIdToTemplateFile(categoryId: string): string {
  return `${categoryId}.html`;
}

export function slugifyHandle(input: string): string {
  const cleaned = [...(input || "").normalize("NFKD")]
    .map((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      if (code >= 0x0300 && code <= 0x036f) return "";
      return ch;
    })
    .join("")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  const parts = cleaned
    .split("-")
    .filter(
      (p) =>
        p &&
        ![
          "dr",
          "the",
          "and",
          "clinic",
          "care",
          "hospital",
          "pvt",
          "ltd",
          "private",
          "limited",
        ].includes(p),
    );

  const base = (parts.length ? parts.join("-") : cleaned || "business").slice(
    0,
    60,
  );
  return base.replace(/^-+|-+$/g, "") || "business";
}
