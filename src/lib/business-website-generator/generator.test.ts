import assert from "node:assert/strict";
import { test } from "node:test";
import {
  encodeAssetMeta,
  decodeAssetMeta,
} from "@/lib/business-discovery/images/attribution";
import { resolveDesignFamily } from "@/lib/business-website-generator/design-systems";
import {
  pdfSafeText,
  validateConceptForProposal,
} from "@/lib/business-website-generator/proposal-pdf";
import { assembleConceptHtml } from "@/lib/business-website-generator/assemble-html";
import { fillDoctorLandingTemplate } from "@/lib/business-website-generator/fill-category-template";
import { getDesignTokens } from "@/lib/business-website-generator/design-systems";
import {
  extractVerifiedExtras,
  resolveDisplayName,
} from "@/lib/business-website-generator/verified-fields";

test("resolveDesignFamily maps categories", () => {
  assert.equal(resolveDesignFamily("Restaurants", "Food & Hospitality"), "restaurant");
  assert.equal(resolveDesignFamily("Dentists", "Healthcare"), "clinic");
  assert.equal(resolveDesignFamily("Barbers", "Personal Care"), "salon");
  assert.equal(resolveDesignFamily("Gyms", "Fitness and Recreation"), "fitness");
  assert.equal(resolveDesignFamily("Lawyers", "Professional Services"), "professional");
});

test("asset attribution round-trip", () => {
  const encoded = encodeAssetMeta({
    imageCategory: "stock",
    altText: "Illustrative cafe",
    provider: "unsplash",
    isIllustrative: true,
    extra: "Photo by Test",
  });
  const decoded = decodeAssetMeta(encoded);
  assert.equal(decoded.imageCategory, "stock");
  assert.equal(decoded.provider, "unsplash");
  assert.equal(decoded.isIllustrative, true);
  assert.match(decoded.altText, /Illustrative cafe/);
});

test("clinic layout surfaces degree and specialty from scrap fields", () => {
  const tokens = getDesignTokens("Doctors", "Healthcare");
  const assembled = assembleConceptHtml({
    business: {
      id: "d1",
      businessName: "Dr Anil Clinic",
      displayName: "Dr Anil Clinic",
      category: "Doctors",
      categoryGroup: "Healthcare",
      city: "Indore",
      countryName: "India",
      address: "MG Road",
      phone: "+91 9753808608",
      publicEmail: null,
      websiteUrl: null,
      description: null,
      openingHours: null,
      degree: "MBBS",
      specialty: "General Physician",
      assets: [],
    },
    tokens,
    copy: {
      conceptTitle: "Dr Anil Clinic concept",
      heroEyebrow: "Doctors · Indore",
      heroHeadline: "Dr Anil Clinic",
      heroSubhead: "MBBS. Serving patients in Indore.",
      primaryCta: "Call +91 9753808608",
      aboutTitle: "About",
      aboutBody: "Clinic listing for Indore.",
      servicesTitle: "Care & information",
      serviceItems: [
        { title: "General Physician", body: "Listed specialty: General Physician." },
        { title: "MBBS", body: "Listed qualification: MBBS." },
        { title: "Contact", body: "Call +91 9753808608 to enquire." },
      ],
      galleryTitle: "Gallery",
      contactTitle: "Contact",
      contactBody: "Reach clinic by phone.",
      footerNote: "Techlyser concept",
      designNotes: "clinic",
    },
  });
  assert.match(assembled.html, /MBBS/);
  assert.match(assembled.html, /General Physician/);
  assert.match(assembled.html, /Dr Anil Clinic/);
  assert.equal(assembled.content.family, "clinic");
});

test("doctor HTML template fills scrap fields dynamically", () => {
  const tokens = getDesignTokens("Doctors", "Healthcare");
  const filled = fillDoctorLandingTemplate({
    business: {
      id: "d2",
      businessName: "Dr Mehta Care Clinic",
      displayName: "Dr Mehta Care Clinic",
      category: "Doctors",
      categoryGroup: "Healthcare",
      city: "Indore",
      countryName: "India",
      address: "A-86, Rau",
      phone: "+91 9753808608",
      publicEmail: null,
      websiteUrl: null,
      description: "Local physician clinic",
      openingHours: "Mo-Sa 10:00-19:00",
      degree: "MBBS, MD",
      specialty: "General Physician",
      assets: [],
    },
    tokens,
    copy: {
      conceptTitle: "Dr Mehta Care Clinic concept",
      heroEyebrow: "Doctors · Indore",
      heroHeadline: "Dr Mehta Care Clinic",
      heroSubhead: "Trusted local physician care in Indore.",
      primaryCta: "Call +91 9753808608",
      aboutTitle: "About",
      aboutBody: "Local physician clinic serving Indore patients.",
      servicesTitle: "Care",
      serviceItems: [{ title: "Consult", body: "Phone booking" }],
      galleryTitle: "Clinic",
      contactTitle: "Contact",
      contactBody: "Call the clinic",
      footerNote: "Techlyser concept",
      designNotes: "doctor template",
    },
  });
  assert.match(filled.html, /Dr Mehta Care Clinic/);
  assert.match(filled.html, /General Physician/);
  assert.match(filled.html, /A-86, Rau/);
  assert.match(filled.html, /Mo-Sa 10:00-19:00/);
  assert.match(filled.html, /Local physician clinic/);
  assert.match(filled.html, /images\.unsplash\.com/);
  assert.match(filled.html, /<img/);
  assert.doesNotMatch(filled.html, /\{\{BUSINESS_NAME\}\}/);
  assert.doesNotMatch(filled.html, /src=""/);
  assert.doesNotMatch(filled.html, /<script/i);
  assert.equal(filled.content.family, "clinic");
  assert.ok(
    filled.content.usedSections.includes("template:doctor") ||
      filled.content.usedSections.includes("template:doctors"),
  );
});

test("english display name preferred from name:en tag", () => {
  const extras = extractVerifiedExtras({
    businessName: "डॉ योगेंद्र सिंह जामड़ा क्लिनिक",
    sourceMetadata: {
      tags: {
        name: "डॉ योगेंद्र सिंह जामड़ा क्लिनिक",
        "name:en": "Dr Yogendra Singh jamra Clinic",
        "healthcare:speciality": "cardiology",
      },
    },
  });
  assert.equal(extras.englishName, "Dr Yogendra Singh jamra Clinic");
  assert.equal(extras.specialty, "Cardiology");
  assert.equal(
    resolveDisplayName({
      businessName: "डॉ योगेंद्र सिंह जामड़ा क्लिनिक",
      englishName: extras.englishName,
    }),
    "Dr Yogendra Singh jamra Clinic",
  );
});

test("assembleConceptHtml includes business name and no script tags", () => {
  const tokens = getDesignTokens("Cafes", "Food & Hospitality");
  const assembled = assembleConceptHtml({
    business: {
      id: "b1",
      businessName: "Sunrise Cafe",
      displayName: "Sunrise Cafe",
      category: "Cafes",
      categoryGroup: "Food & Hospitality",
      city: "Mumbai",
      countryName: "India",
      address: null,
      phone: "+91 1000000000",
      publicEmail: null,
      websiteUrl: null,
      description: "Neighborhood cafe",
      openingHours: "Mo-Su 08:00-20:00",
      degree: null,
      specialty: null,
      assets: [],
    },
    tokens,
    copy: {
      conceptTitle: "Sunrise Cafe concept",
      heroEyebrow: "Cafes · Mumbai",
      heroHeadline: "Sunrise Cafe",
      heroSubhead: "A calm place for coffee.",
      primaryCta: "Call +91 1000000000",
      aboutTitle: "About",
      aboutBody: "Neighborhood cafe",
      servicesTitle: "Highlights",
      serviceItems: [
        { title: "Coffee", body: "Freshly prepared drinks" },
        { title: "Local", body: "Easy to find in Mumbai" },
        { title: "Contact", body: "Call to enquire" },
      ],
      galleryTitle: "Gallery",
      contactTitle: "Contact",
      contactBody: "Use verified details only.",
      footerNote: "Techlyser concept",
      designNotes: "restaurant system",
    },
  });
  assert.match(assembled.html, /Sunrise Cafe/);
  assert.doesNotMatch(assembled.html, /<script/i);
});

test("pdfSafeText strips Hindi glyphs for Helvetica", () => {
  assert.equal(pdfSafeText("डॉ. अनिल", "Clinic"), "Clinic");
  assert.equal(pdfSafeText("Cafe Mumbai", "x"), "Cafe Mumbai");
  assert.equal(pdfSafeText("Hello — world"), "Hello - world");
});

test("validateConceptForProposal passes with concept html even without screenshots", () => {
  const result = validateConceptForProposal({
    businessName: "Test",
    category: "Cafe",
    html: "<html>" + "x".repeat(500) + "</html>",
    hasDesktopShot: false,
    hasMobileShot: false,
  });
  assert.equal(result.needsReview, false);
  assert.equal(result.ok, true);
});
