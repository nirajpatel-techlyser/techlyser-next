import assert from "node:assert/strict";
import { test } from "node:test";
import {
  categoryIdToPublicSlug,
  isKnownPublicCategorySlug,
  publicSlugToCategoryId,
  resolveCategoryIdFromLabelOrId,
  RESERVED_PUBLIC_PATHS,
  slugifyHandle,
} from "@/lib/business-website-generator/public-listing-slugs";
import {
  assembleFromCategoryTemplate,
  resolveCategoryTemplatePath,
} from "@/lib/business-website-generator/fill-category-template";
import { getDesignTokens } from "@/lib/business-website-generator/design-systems";
import {
  buildOpportunityEmailDraft,
  normalizeWhatsAppPhone,
} from "@/lib/business-discovery/outreach-draft";

test("category id maps to marketing public slug", () => {
  assert.equal(categoryIdToPublicSlug("doctors"), "doctor");
  assert.equal(categoryIdToPublicSlug("hair-salons"), "hair-salon");
  assert.equal(categoryIdToPublicSlug("restaurants"), "restaurant");
  assert.equal(publicSlugToCategoryId("doctor"), "doctors");
  assert.equal(publicSlugToCategoryId("hair-salon"), "hair-salons");
  assert.equal(resolveCategoryIdFromLabelOrId("Doctors"), "doctors");
  assert.equal(resolveCategoryIdFromLabelOrId("Hair salons"), "hair-salons");
});

test("known vs reserved/unknown category slugs", () => {
  assert.equal(isKnownPublicCategorySlug("doctor"), true);
  assert.equal(isKnownPublicCategorySlug("cafe"), true);
  assert.equal(isKnownPublicCategorySlug("services"), false);
  assert.equal(isKnownPublicCategorySlug("admin"), false);
  assert.equal(isKnownPublicCategorySlug("shopify-developers"), false);
  assert.ok(RESERVED_PUBLIC_PATHS.has("blog"));
  assert.equal(publicSlugToCategoryId("admin"), null);
});

test("slugifyHandle produces short english handles", () => {
  assert.equal(
    slugifyHandle("Dr Yogendra Singh jamra Clinic"),
    "yogendra-singh-jamra",
  );
  assert.equal(slugifyHandle("Sunrise Cafe & Bakery"), "sunrise-cafe-bakery");
  assert.match(slugifyHandle("A"), /^[a-z0-9-]+$/);
});

test("template resolution works for multiple category ids", () => {
  assert.ok(
    resolveCategoryTemplatePath({
      categoryId: "doctors",
      family: "clinic",
    })?.endsWith("doctor.html") ||
      resolveCategoryTemplatePath({
        categoryId: "doctors",
        family: "clinic",
      })?.endsWith("doctors.html"),
  );
  assert.ok(
    resolveCategoryTemplatePath({
      categoryId: "restaurants",
      family: "restaurant",
    }),
  );
  assert.ok(
    resolveCategoryTemplatePath({
      categoryId: "hair-salons",
      family: "salon",
    }),
  );
  assert.ok(
    resolveCategoryTemplatePath({
      categoryId: "gyms",
      family: "fitness",
    }),
  );
  assert.ok(
    resolveCategoryTemplatePath({
      categoryId: "plumbers",
      family: "home_services",
    }),
  );
});

test("assembleFromCategoryTemplate fills restaurant template", () => {
  const tokens = getDesignTokens("Restaurants", "Food & Hospitality");
  const assembled = assembleFromCategoryTemplate({
    business: {
      id: "r1",
      businessName: "Spice Route Kitchen",
      displayName: "Spice Route Kitchen",
      category: "Restaurants",
      categoryGroup: "Food & Hospitality",
      city: "Indore",
      countryName: "India",
      address: "12 MG Road",
      phone: "+91 98765 43210",
      publicEmail: null,
      websiteUrl: null,
      description: null,
      openingHours: "Mon–Sat · 10am–7pm",
      degree: null,
      specialty: null,
      assets: [],
    },
    tokens,
    copy: {
      conceptTitle: "Spice Route Kitchen concept",
      heroEyebrow: "Restaurants · Indore",
      heroHeadline: "Spice Route Kitchen",
      heroSubhead: "Multi-cuisine dining in Indore.",
      primaryCta: "Call now",
      aboutTitle: "About",
      aboutBody: "Listed restaurant in Indore.",
      servicesTitle: "Highlights",
      serviceItems: [
        { title: "Dine-in", body: "Favourites" },
        { title: "Location", body: "Easy to find" },
        { title: "Call", body: "Enquire" },
      ],
      galleryTitle: "Gallery",
      contactTitle: "Contact",
      contactBody: "Call",
      footerNote: "Techlyser",
      designNotes: "restaurant template",
    },
    categoryId: "restaurants",
  });
  assert.ok(assembled);
  assert.match(assembled!.html, /Spice Route Kitchen/);
  assert.match(assembled!.html, /12 MG Road/);
  assert.doesNotMatch(assembled!.html, /\{\{BUSINESS_NAME\}\}/);
  assert.doesNotMatch(assembled!.html, /src=""/);
});

test("outreach draft injects public listing URL", () => {
  const draft = buildOpportunityEmailDraft({
    businessName: "Dr Yogendra Clinic",
    city: "Indore",
    countryName: "India",
    category: "Doctors",
    publicEmail: null,
    phone: "+91 9753808608",
    websiteUrl: null,
    publicListingUrl: "https://techlyser.com/doctor/yogendra-jamra",
  });
  assert.match(draft.emailBody, /techlyser\.com\/doctor\/yogendra-jamra/);
  assert.match(draft.whatsappBody, /techlyser\.com\/doctor\/yogendra-jamra/);
});

test("normalizeWhatsAppPhone adds India country code", () => {
  assert.equal(normalizeWhatsAppPhone("9753808608", "IN"), "919753808608");
  assert.equal(normalizeWhatsAppPhone("+91 97538 08608", "IN"), "919753808608");
  assert.equal(normalizeWhatsAppPhone(null, "IN"), null);
});
