import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { escapeHtml, sanitizeConceptHtml } from "@/lib/business-website-generator/sanitize";
import {
  resolveCategoryIdFromLabelOrId,
  categoryIdToTemplateFile,
} from "@/lib/business-website-generator/public-listing-slugs";
import type {
  AssembledConcept,
  ConceptBusiness,
  ConceptCopy,
  DesignTokens,
} from "@/lib/business-website-generator/types";

/** Verified stock healthcare images (checked reachable). Always keep design looking complete. */
export const DOCTOR_STOCK_IMAGES = {
  HERO_IMAGE:
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1600&q=80",
  ABOUT_IMAGE:
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=80",
  GALLERY_1:
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&q=80",
  GALLERY_2:
    "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=1000&q=80",
  GALLERY_3:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80",
  GALLERY_4:
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80",
  GALLERY_5:
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1000&q=80",
} as const;

const FAMILY_FALLBACK_FILES: Record<DesignTokens["family"], string[]> = {
  clinic: ["doctors.html", "doctor.html", "clinics.html"],
  restaurant: ["restaurants.html", "restaurant.html"],
  salon: ["hair-salons.html", "salon.html", "barbers.html"],
  retail: ["retail.html", "grocery-stores.html"],
  fitness: ["fitness.html", "gyms.html"],
  professional: ["professional.html", "consultants.html"],
  home_services: ["home-services.html", "plumbers.html"],
  default: ["retail.html", "restaurants.html"],
};

const IMAGE_KEYS = [
  "HERO_IMAGE",
  "ABOUT_IMAGE",
  "GALLERY_1",
  "GALLERY_2",
  "GALLERY_3",
  "GALLERY_4",
  "GALLERY_5",
] as const;

function hoursText(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string" && value.trim()) return value.trim();
  try {
    const text = JSON.stringify(value);
    return text && text !== "null" ? text : null;
  } catch {
    return null;
  }
}

/** Only reuse real listing/stock photos — never screenshots or empty URLs. */
function usableListingPhotos(business: ConceptBusiness): string[] {
  return business.assets
    .filter((a) => a.assetType === "PHOTO" || a.assetType === "OTHER")
    .map((a) => a.assetUrl.trim())
    .filter((url) => /^https:\/\//i.test(url));
}

function templatesDir() {
  return path.join(process.cwd(), "public", "templates", "business-landing");
}

function extractDataFallbacks(html: string): Partial<Record<(typeof IMAGE_KEYS)[number], string>> {
  const out: Partial<Record<(typeof IMAGE_KEYS)[number], string>> = {};
  for (const key of IMAGE_KEYS) {
    const re = new RegExp(
      `src="\\{\\{${key}\\}\\}"[^>]*data-fallback="([^"]+)"|data-fallback="([^"]+)"[^>]*src="\\{\\{${key}\\}\\}"`,
      "i",
    );
    const m = html.match(re);
    const url = (m?.[1] || m?.[2] || "").trim();
    if (url.startsWith("https://")) out[key] = url;
  }
  return out;
}

function resolveImageSlots(
  scrap: string[],
  fallbacks: Partial<Record<(typeof IMAGE_KEYS)[number], string>>,
  clinicDefaults: boolean,
) {
  const stock = clinicDefaults
    ? DOCTOR_STOCK_IMAGES
    : {
        HERO_IMAGE:
          fallbacks.HERO_IMAGE || DOCTOR_STOCK_IMAGES.HERO_IMAGE,
        ABOUT_IMAGE:
          fallbacks.ABOUT_IMAGE || DOCTOR_STOCK_IMAGES.ABOUT_IMAGE,
        GALLERY_1: fallbacks.GALLERY_1 || DOCTOR_STOCK_IMAGES.GALLERY_1,
        GALLERY_2: fallbacks.GALLERY_2 || DOCTOR_STOCK_IMAGES.GALLERY_2,
        GALLERY_3: fallbacks.GALLERY_3 || DOCTOR_STOCK_IMAGES.GALLERY_3,
        GALLERY_4: fallbacks.GALLERY_4 || DOCTOR_STOCK_IMAGES.GALLERY_4,
        GALLERY_5: fallbacks.GALLERY_5 || DOCTOR_STOCK_IMAGES.GALLERY_5,
      };

  return {
    HERO_IMAGE: scrap[0] || stock.HERO_IMAGE,
    ABOUT_IMAGE: scrap[1] || scrap[0] || stock.ABOUT_IMAGE,
    GALLERY_1: scrap[2] || stock.GALLERY_1,
    GALLERY_2: scrap[3] || stock.GALLERY_2,
    GALLERY_3: scrap[4] || stock.GALLERY_3,
    GALLERY_4: scrap[5] || stock.GALLERY_4,
    GALLERY_5: scrap[6] || stock.GALLERY_5,
  };
}

function applyPlaceholders(html: string, values: Record<string, string>) {
  let out = html;
  for (const [key, value] of Object.entries(values)) {
    out = out.split(`{{${key}}}`).join(value);
  }
  out = out.replace(/\{\{[A-Z0-9_]+\}\}/g, "");
  return out;
}

function safeAttrUrl(url: string, fallback: string) {
  const chosen = url?.trim() || fallback;
  return escapeHtml(chosen);
}

export function resolveCategoryTemplatePath(input: {
  categoryId?: string | null;
  categoryLabel?: string | null;
  family: DesignTokens["family"];
}): string | null {
  const dir = templatesDir();
  const candidates: string[] = [];

  const id =
    input.categoryId ||
    (input.categoryLabel
      ? resolveCategoryIdFromLabelOrId(input.categoryLabel)
      : null);

  if (id) {
    candidates.push(categoryIdToTemplateFile(id));
    // Singular alias used by some templates (doctor.html, restaurant.html).
    if (id.endsWith("s") && id !== "fast-food") {
      candidates.push(`${id.slice(0, -1)}.html`);
    }
    if (id === "doctors") candidates.unshift("doctor.html", "doctors.html");
    if (id === "restaurants") {
      candidates.unshift("restaurant.html", "restaurants.html");
    }
  }

  for (const file of FAMILY_FALLBACK_FILES[input.family] || []) {
    candidates.push(file);
  }

  const seen = new Set<string>();
  for (const file of candidates) {
    if (!file || seen.has(file)) continue;
    seen.add(file);
    const full = path.join(dir, file);
    if (existsSync(full)) return full;
  }
  return null;
}

export function hasCategoryHtmlTemplate(
  family: DesignTokens["family"],
  categoryLabel?: string | null,
) {
  return Boolean(
    resolveCategoryTemplatePath({
      categoryLabel: categoryLabel || null,
      family,
    }),
  );
}

/**
 * Fill a category HTML template from verified scrap fields.
 * Scrap photos replace placeholders only when usable https PHOTO assets exist.
 */
export function fillCategoryLandingTemplate(input: {
  business: ConceptBusiness;
  tokens: DesignTokens;
  copy: ConceptCopy;
  categoryId?: string | null;
  templatePath?: string | null;
}): AssembledConcept | null {
  const { business, tokens, copy } = input;
  const templatePath =
    input.templatePath ||
    resolveCategoryTemplatePath({
      categoryId: input.categoryId,
      categoryLabel: business.category,
      family: tokens.family,
    });
  if (!templatePath) return null;

  let html = readFileSync(templatePath, "utf8");
  html = html.replace(/<p class="template-note">[\s\S]*?<\/p>\s*/i, "");
  html = html.replace(/<script>[\s\S]*?<\/script>\s*/i, "");

  const displayName = business.displayName || business.businessName;
  const scrapPhotos = usableListingPhotos(business);
  const dataFallbacks = extractDataFallbacks(html);
  const clinicDefaults = tokens.family === "clinic";
  const images = resolveImageSlots(scrapPhotos, dataFallbacks, clinicDefaults);
  const hours = hoursText(business.openingHours);
  const degree = business.degree?.trim() || "Not listed";
  const specialty = business.specialty?.trim() || business.category;
  const phone = business.phone?.trim() || "Not listed publicly";
  const email = business.publicEmail?.trim() || "Not listed publicly";
  const address =
    business.address?.trim() || `${business.city}, ${business.countryName}`;

  const aboutShort =
    copy.heroSubhead?.trim() ||
    `${specialty} for customers in ${business.city}.`;
  const aboutLong =
    copy.aboutBody?.trim() ||
    `${displayName} is listed as a ${business.category.toLowerCase()} business in ${business.city}, ${business.countryName}. This concept uses only public listing details.`;

  const serviceItems = copy.serviceItems || [];
  const imageNotes: string[] = [];
  if (scrapPhotos.length) {
    imageNotes.push(
      `Using ${scrapPhotos.length} listing image(s); remaining slots use category placeholders.`,
    );
  } else {
    imageNotes.push(
      "Category stock placeholders used so the landing design stays complete (no listing photos found).",
    );
  }

  const templateStem = path.basename(templatePath, ".html");
  const heroFallback =
    dataFallbacks.HERO_IMAGE || DOCTOR_STOCK_IMAGES.HERO_IMAGE;

  const values: Record<string, string> = {
    BUSINESS_NAME: escapeHtml(displayName),
    CATEGORY: escapeHtml(business.category),
    CITY: escapeHtml(business.city),
    DEGREE: escapeHtml(degree),
    SPECIALTY: escapeHtml(specialty),
    PHONE: escapeHtml(phone),
    EMAIL: escapeHtml(email),
    ADDRESS: escapeHtml(address),
    HOURS: escapeHtml(hours || "Hours not listed publicly"),
    ABOUT_SHORT: escapeHtml(aboutShort),
    ABOUT_LONG: escapeHtml(aboutLong),
    SERVICE_1: escapeHtml(serviceItems[0]?.title || specialty),
    SERVICE_2: escapeHtml(serviceItems[1]?.title || "Easy to find"),
    SERVICE_3: escapeHtml(serviceItems[2]?.title || "Call to enquire"),
    HERO_IMAGE: safeAttrUrl(images.HERO_IMAGE, heroFallback),
    ABOUT_IMAGE: safeAttrUrl(
      images.ABOUT_IMAGE,
      dataFallbacks.ABOUT_IMAGE || DOCTOR_STOCK_IMAGES.ABOUT_IMAGE,
    ),
    GALLERY_1: safeAttrUrl(
      images.GALLERY_1,
      dataFallbacks.GALLERY_1 || DOCTOR_STOCK_IMAGES.GALLERY_1,
    ),
    GALLERY_2: safeAttrUrl(
      images.GALLERY_2,
      dataFallbacks.GALLERY_2 || DOCTOR_STOCK_IMAGES.GALLERY_2,
    ),
    GALLERY_3: safeAttrUrl(
      images.GALLERY_3,
      dataFallbacks.GALLERY_3 || DOCTOR_STOCK_IMAGES.GALLERY_3,
    ),
    GALLERY_4: safeAttrUrl(
      images.GALLERY_4,
      dataFallbacks.GALLERY_4 || DOCTOR_STOCK_IMAGES.GALLERY_4,
    ),
    GALLERY_5: safeAttrUrl(
      images.GALLERY_5,
      dataFallbacks.GALLERY_5 || DOCTOR_STOCK_IMAGES.GALLERY_5,
    ),
  };

  html = sanitizeConceptHtml(applyPlaceholders(html, values));
  html = html.replace(/src=""/g, `src="${escapeHtml(heroFallback)}"`);

  return {
    conceptTitle: copy.conceptTitle,
    html,
    content: {
      ...copy,
      family: tokens.family,
      usedSections: [
        `template:${templateStem}`,
        "nav",
        "hero",
        "about",
        "care",
        "gallery",
        "contact",
        "footer",
      ],
      imageNotes,
    },
  };
}

/** @deprecated Prefer fillCategoryLandingTemplate — kept for tests/callers. */
export function fillDoctorLandingTemplate(input: {
  business: ConceptBusiness;
  tokens: DesignTokens;
  copy: ConceptCopy;
}): AssembledConcept {
  const assembled = fillCategoryLandingTemplate({
    ...input,
    categoryId: "doctors",
  });
  if (!assembled) {
    throw new Error("Doctor landing template missing.");
  }
  return assembled;
}

export function assembleFromCategoryTemplate(input: {
  business: ConceptBusiness;
  tokens: DesignTokens;
  copy: ConceptCopy;
  categoryId?: string | null;
}): AssembledConcept | null {
  return fillCategoryLandingTemplate(input);
}
