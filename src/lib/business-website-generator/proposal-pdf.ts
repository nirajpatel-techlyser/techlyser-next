import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/seo";
import {
  generateWebsiteConcept,
  getLatestConcept,
} from "@/lib/business-website-generator/generate-concept";
import { getDesignTokens } from "@/lib/business-website-generator/design-systems";
import { fallbackCopy } from "@/lib/business-website-generator/ai-content";
import { renderConceptHtmlDesktopCapture } from "@/lib/business-website-generator/render-concept-pdf";
import {
  extractVerifiedExtras,
  resolveDisplayName,
} from "@/lib/business-website-generator/verified-fields";
import type { ConceptCopy, DesignTokens } from "@/lib/business-website-generator/types";

const WHITE = rgb(1, 1, 1);
const SLATE = rgb(0.96, 0.97, 0.98);

/**
 * Helvetica/StandardFonts only support WinAnsi. Hindi/other scripts crash drawText.
 */
export function pdfSafeText(input: string, fallback = "") {
  const cleaned = [...(input || "").normalize("NFKC")]
    .map((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      if (code >= 0x20 && code <= 0x7e) return ch;
      if (ch === "—" || ch === "–") return "-";
      if (ch === "•" || ch === "·") return "-";
      if (ch === "“" || ch === "”" || ch === "„") return '"';
      if (ch === "‘" || ch === "’") return "'";
      if (ch === "…") return "...";
      if (ch === "×") return "x";
      if (code >= 0xa0 && code <= 0xff) return ch;
      return "";
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || !/[A-Za-z0-9]/.test(cleaned)) return fallback;
  return cleaned;
}

function hexToRgb(hex: string) {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = Number.parseInt(full.slice(0, 6), 16);
  if (!Number.isFinite(n)) return rgb(0.1, 0.1, 0.1);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function wrap(text: string, max = 78) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max) {
      if (current) lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  return lines;
}

function drawLines(
  page: PDFPage,
  lines: string[],
  opts: {
    x: number;
    y: number;
    size: number;
    font: PDFFont;
    color: ReturnType<typeof rgb>;
    gap?: number;
  },
) {
  let y = opts.y;
  for (const line of lines) {
    page.drawText(line, {
      x: opts.x,
      y,
      size: opts.size,
      font: opts.font,
      color: opts.color,
    });
    y -= opts.gap ?? opts.size + 4;
  }
  return y;
}

export type ProposalQuality = {
  ok: boolean;
  needsReview: boolean;
  issues: string[];
};

export function validateConceptForProposal(input: {
  businessName: string;
  category: string;
  html: string;
  hasDesktopShot: boolean;
  hasMobileShot: boolean;
}): ProposalQuality {
  const issues: string[] = [];
  if (!input.businessName.trim()) issues.push("Missing business name.");
  if (!input.category.trim()) issues.push("Missing category.");
  if (!input.html || input.html.length < 400) issues.push("Concept HTML is empty or too short.");
  if (/Generating…/.test(input.html)) issues.push("Concept HTML still shows generating placeholder.");
  // Screenshots optional now — PDF draws the landing page from scraped data.
  return {
    ok: issues.length === 0,
    needsReview: issues.length > 0,
    issues,
  };
}

function readStoredCopy(generatedContent: unknown, fallback: ConceptCopy): ConceptCopy {
  if (!generatedContent || typeof generatedContent !== "object") return fallback;
  const row = generatedContent as Record<string, unknown>;
  const items = Array.isArray(row.serviceItems) ? row.serviceItems : [];
  const serviceItems = items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const r = item as Record<string, unknown>;
      if (typeof r.title !== "string" || typeof r.body !== "string") return null;
      return { title: r.title, body: r.body };
    })
    .filter((x): x is { title: string; body: string } => Boolean(x));
  return {
    conceptTitle:
      typeof row.conceptTitle === "string" ? row.conceptTitle : fallback.conceptTitle,
    heroEyebrow: typeof row.heroEyebrow === "string" ? row.heroEyebrow : fallback.heroEyebrow,
    heroHeadline:
      typeof row.heroHeadline === "string" ? row.heroHeadline : fallback.heroHeadline,
    heroSubhead: typeof row.heroSubhead === "string" ? row.heroSubhead : fallback.heroSubhead,
    primaryCta: typeof row.primaryCta === "string" ? row.primaryCta : fallback.primaryCta,
    aboutTitle: typeof row.aboutTitle === "string" ? row.aboutTitle : fallback.aboutTitle,
    aboutBody: typeof row.aboutBody === "string" ? row.aboutBody : fallback.aboutBody,
    servicesTitle:
      typeof row.servicesTitle === "string" ? row.servicesTitle : fallback.servicesTitle,
    serviceItems: serviceItems.length ? serviceItems : fallback.serviceItems,
    galleryTitle: typeof row.galleryTitle === "string" ? row.galleryTitle : fallback.galleryTitle,
    contactTitle: typeof row.contactTitle === "string" ? row.contactTitle : fallback.contactTitle,
    contactBody: typeof row.contactBody === "string" ? row.contactBody : fallback.contactBody,
    footerNote: typeof row.footerNote === "string" ? row.footerNote : fallback.footerNote,
    designNotes: typeof row.designNotes === "string" ? row.designNotes : fallback.designNotes,
  };
}

/** Draw a category landing-page mock into the PDF (the page we would build for them). */
function drawLandingDesktopPage(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  tokens: DesignTokens,
  copy: ConceptCopy,
  details: {
    name: string;
    category: string;
    city: string;
    country: string;
    degree: string;
    specialty: string;
    phone: string;
    email: string;
    address: string;
  },
) {
  const pageW = 595;
  const pageH = 842;
  const accent = hexToRgb(tokens.accent);
  const ink = hexToRgb(tokens.ink);
  const muted = hexToRgb(tokens.muted);
  const soft = hexToRgb(tokens.accentSoft);

  page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: SLATE });
  page.drawText(
    pdfSafeText(`YOUR ${details.category.toUpperCase()} WEBSITE CONCEPT`, "WEBSITE CONCEPT"),
    { x: 36, y: pageH - 36, size: 9, font: fontBold, color: accent },
  );
  page.drawText("This is how your website could look", {
    x: 36,
    y: pageH - 54,
    size: 14,
    font: fontBold,
    color: ink,
  });

  // Browser frame
  const frameX = 36;
  const frameY = 70;
  const frameW = pageW - 72;
  const frameH = pageH - 140;
  page.drawRectangle({
    x: frameX,
    y: frameY,
    width: frameW,
    height: frameH,
    color: WHITE,
    borderColor: rgb(0.88, 0.9, 0.92),
    borderWidth: 1,
  });
  page.drawRectangle({
    x: frameX,
    y: frameY + frameH - 26,
    width: frameW,
    height: 26,
    color: rgb(0.97, 0.98, 0.99),
  });
  page.drawCircle({
    x: frameX + 14,
    y: frameY + frameH - 13,
    size: 3.5,
    color: rgb(0.8, 0.82, 0.85),
  });
  page.drawCircle({
    x: frameX + 26,
    y: frameY + frameH - 13,
    size: 3.5,
    color: rgb(0.8, 0.82, 0.85),
  });
  page.drawCircle({
    x: frameX + 38,
    y: frameY + frameH - 13,
    size: 3.5,
    color: rgb(0.8, 0.82, 0.85),
  });

  // Hero
  const heroH = 200;
  page.drawRectangle({
    x: frameX + 1,
    y: frameY + frameH - 26 - heroH,
    width: frameW - 2,
    height: heroH,
    color: hexToRgb(tokens.ink),
  });
  page.drawRectangle({
    x: frameX + frameW - 150,
    y: frameY + frameH - 26 - heroH + 24,
    width: 120,
    height: heroH - 48,
    color: soft,
  });
  page.drawText(pdfSafeText(details.category.toUpperCase(), "BUSINESS").slice(0, 28), {
    x: frameX + 20,
    y: frameY + frameH - 50,
    size: 8,
    font: fontBold,
    color: accent,
  });
  page.drawText(details.name.slice(0, 34), {
    x: frameX + 20,
    y: frameY + frameH - 78,
    size: 18,
    font: fontBold,
    color: WHITE,
  });
  const cred = pdfSafeText(
    [details.degree, details.specialty].filter(Boolean).join(" | "),
    "",
  );
  let hy = frameY + frameH - 98;
  if (cred) {
    page.drawText(cred.slice(0, 55), {
      x: frameX + 20,
      y: hy,
      size: 9,
      font,
      color: rgb(0.85, 0.88, 0.92),
    });
    hy -= 16;
  }
  for (const line of wrap(pdfSafeText(copy.heroSubhead, details.category), 48).slice(0, 3)) {
    page.drawText(line, {
      x: frameX + 20,
      y: hy,
      size: 9,
      font,
      color: rgb(0.78, 0.82, 0.86),
    });
    hy -= 12;
  }
  page.drawRectangle({
    x: frameX + 20,
    y: frameY + frameH - 26 - heroH + 22,
    width: 120,
    height: 20,
    color: accent,
  });
  page.drawText(pdfSafeText(copy.primaryCta, "Call now").slice(0, 22), {
    x: frameX + 28,
    y: frameY + frameH - 26 - heroH + 28,
    size: 9,
    font: fontBold,
    color: WHITE,
  });

  // Service cards
  let cardY = frameY + frameH - 26 - heroH - 110;
  page.drawText(pdfSafeText(copy.servicesTitle, "What we offer").slice(0, 40), {
    x: frameX + 20,
    y: cardY + 78,
    size: 12,
    font: fontBold,
    color: ink,
  });
  const cardW = (frameW - 56) / 3;
  copy.serviceItems.slice(0, 3).forEach((item, index) => {
    const x = frameX + 20 + index * (cardW + 8);
    page.drawRectangle({
      x,
      y: cardY,
      width: cardW,
      height: 70,
      color: SLATE,
      borderColor: rgb(0.88, 0.9, 0.92),
      borderWidth: 1,
    });
    page.drawText(pdfSafeText(item.title, "Detail").slice(0, 20), {
      x: x + 8,
      y: cardY + 48,
      size: 9,
      font: fontBold,
      color: accent,
    });
    let sy = cardY + 34;
    for (const line of wrap(pdfSafeText(item.body, ""), 22).slice(0, 3)) {
      page.drawText(line, { x: x + 8, y: sy, size: 7, font, color: muted });
      sy -= 10;
    }
  });

  // Contact strip
  page.drawRectangle({
    x: frameX + 1,
    y: frameY + 1,
    width: frameW - 2,
    height: 72,
    color: rgb(0.98, 0.98, 0.99),
  });
  page.drawText(`Phone: ${details.phone}`.slice(0, 42), {
    x: frameX + 16,
    y: frameY + 48,
    size: 9,
    font: fontBold,
    color: ink,
  });
  page.drawText(`Email: ${details.email}`.slice(0, 48), {
    x: frameX + 16,
    y: frameY + 32,
    size: 9,
    font,
    color: muted,
  });
  page.drawText(`Location: ${details.address}`.slice(0, 55), {
    x: frameX + 16,
    y: frameY + 16,
    size: 9,
    font,
    color: muted,
  });
}

async function ensureReadyConcept(businessOpportunityId: string) {
  let concept = await getLatestConcept(businessOpportunityId);
  if (concept && concept.generationStatus === "READY" && concept.generatedHtml.length > 400) {
    return concept;
  }
  return generateWebsiteConcept(businessOpportunityId);
}

function drawCoverPage(
  pdf: PDFDocument,
  font: PDFFont,
  fontBold: PDFFont,
  tokens: DesignTokens,
  details: {
    safeName: string;
    safeCategory: string;
    safeCity: string;
    safeCountry: string;
    safeDegree: string;
    safeSpecialty: string;
    templateHint: string;
  },
) {
  const pageW = 595;
  const pageH = 842;
  const accent = hexToRgb(tokens.accent);
  const page = pdf.addPage([pageW, pageH]);
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageW,
    height: pageH,
    color: hexToRgb(tokens.ink),
  });
  page.drawRectangle({ x: 0, y: pageH - 8, width: pageW, height: 8, color: accent });
  page.drawText("TECHLYSER", {
    x: 40,
    y: pageH - 56,
    size: 11,
    font: fontBold,
    color: accent,
  });
  page.drawText("Your website could look like this", {
    x: 40,
    y: pageH - 100,
    size: 22,
    font: fontBold,
    color: WHITE,
  });
  page.drawText(details.safeName, {
    x: 40,
    y: pageH - 140,
    size: 26,
    font: fontBold,
    color: WHITE,
  });
  page.drawText(
    pdfSafeText(
      `${details.safeCategory} | ${details.safeCity}, ${details.safeCountry}`,
    ).slice(0, 70),
    {
      x: 40,
      y: pageH - 168,
      size: 11,
      font,
      color: rgb(0.7, 0.73, 0.78),
    },
  );
  if (details.safeDegree || details.safeSpecialty) {
    page.drawText(
      pdfSafeText(
        [details.safeDegree, details.safeSpecialty].filter(Boolean).join(" | "),
      ).slice(0, 70),
      {
        x: 40,
        y: pageH - 190,
        size: 11,
        font,
        color: rgb(0.85, 0.88, 0.9),
      },
    );
  }
  let y = pageH - 240;
  for (const line of wrap(
    pdfSafeText(
      "The next pages are the exact website concept from Website Studio — same design and listing content. Share this PDF on WhatsApp or email.",
      "",
    ),
    78,
  ).slice(0, 5)) {
    page.drawText(line, { x: 40, y, size: 11, font, color: rgb(0.82, 0.84, 0.88) });
    y -= 16;
  }
  page.drawText(pdfSafeText(details.templateHint).slice(0, 70), {
    x: 40,
    y: 68,
    size: 9,
    font,
    color: rgb(0.65, 0.68, 0.72),
  });
  page.drawText("Prepared by Techlyser - proposal preview only (not emailed automatically)", {
    x: 40,
    y: 48,
    size: 9,
    font,
    color: rgb(0.55, 0.58, 0.62),
  });
}

/** Landscape desktop page size — wider frame matches studio desktop preview. */
const DESKTOP_PAGE_W = 842;
const DESKTOP_PAGE_H = 595;

async function appendDesktopWebsitePages(
  pdf: PDFDocument,
  pngBytes: Uint8Array,
) {
  const image = await pdf.embedPng(pngBytes);
  const pageW = DESKTOP_PAGE_W;
  const pageH = DESKTOP_PAGE_H;
  const scale = pageW / image.width;
  const scaledH = image.height * scale;
  const pageCount = Math.max(1, Math.ceil(scaledH / pageH));

  for (let i = 0; i < pageCount; i++) {
    const page = pdf.addPage([pageW, pageH]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageW,
      height: pageH,
      color: WHITE,
    });
    // Shift the full-page desktop capture upward per slide.
    page.drawImage(image, {
      x: 0,
      y: pageH - scaledH + i * pageH,
      width: pageW,
      height: scaledH,
    });
  }
}

function drawClosingPage(
  pdf: PDFDocument,
  font: PDFFont,
  fontBold: PDFFont,
  tokens: DesignTokens,
  safeName: string,
) {
  const pageW = DESKTOP_PAGE_W;
  const pageH = DESKTOP_PAGE_H;
  const accent = hexToRgb(tokens.accent);
  const page = pdf.addPage([pageW, pageH]);
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageW,
    height: pageH,
    color: hexToRgb(tokens.ink),
  });
  page.drawRectangle({ x: 0, y: pageH - 8, width: pageW, height: 8, color: accent });

  page.drawText("TECHLYSER", {
    x: 48,
    y: pageH - 72,
    size: 14,
    font: fontBold,
    color: accent,
  });
  page.drawText("We can build this website for you", {
    x: 48,
    y: pageH - 118,
    size: 26,
    font: fontBold,
    color: WHITE,
  });
  page.drawText(
    pdfSafeText(
      `Website concept prepared for ${safeName}. Share this PDF as a visual proposal.`,
    ).slice(0, 95),
    {
      x: 48,
      y: pageH - 152,
      size: 12,
      font,
      color: rgb(0.82, 0.84, 0.88),
    },
  );

  page.drawText("Contact Techlyser", {
    x: 48,
    y: pageH - 220,
    size: 13,
    font: fontBold,
    color: WHITE,
  });

  let y = pageH - 252;
  for (const line of [
    siteConfig.url.replace(/^https?:\/\//, ""),
    "info@techlyser.com",
    siteConfig.phoneDisplay || "",
  ].filter(Boolean)) {
    page.drawText(pdfSafeText(line).slice(0, 70), {
      x: 48,
      y,
      size: 14,
      font,
      color: rgb(0.88, 0.9, 0.93),
    });
    y -= 28;
  }

  page.drawText("Nothing is auto-sent from the admin panel.", {
    x: 48,
    y: 70,
    size: 10,
    font,
    color: rgb(0.65, 0.68, 0.72),
  });
  page.drawText(`(c) ${new Date().getFullYear()} Techlyser`, {
    x: 48,
    y: 48,
    size: 9,
    font,
    color: rgb(0.55, 0.58, 0.62),
  });
}

/**
 * Build outreach PDF from the exact Website Studio HTML (same design + content).
 * Falls back to a drawn mock only if HTML rendering is unavailable.
 */
export async function buildAgencyProposalPdf(businessOpportunityId: string) {
  const business = await prisma.businessOpportunity.findUnique({
    where: { id: businessOpportunityId },
    select: {
      id: true,
      businessName: true,
      category: true,
      categoryGroup: true,
      city: true,
      countryName: true,
      phone: true,
      publicEmail: true,
      address: true,
      description: true,
      openingHours: true,
      sourceMetadata: true,
    },
  });
  if (!business) throw new Error("Business not found.");

  const concept = await ensureReadyConcept(businessOpportunityId);

  const extras = extractVerifiedExtras({
    businessName: business.businessName,
    description: business.description,
    sourceMetadata: business.sourceMetadata,
  });
  const displayName = resolveDisplayName({
    businessName: business.businessName,
    englishName: extras.englishName,
  });
  const tokens = getDesignTokens(business.category, business.categoryGroup);
  const conceptBusiness = {
    id: business.id,
    businessName: business.businessName,
    displayName,
    category: business.category,
    categoryGroup: business.categoryGroup,
    city: business.city,
    countryName: business.countryName,
    address: business.address,
    phone: business.phone,
    publicEmail: business.publicEmail,
    websiteUrl: null,
    description: business.description,
    openingHours: business.openingHours,
    degree: extras.degree,
    specialty: extras.specialty,
    assets: [],
  };
  const copy = readStoredCopy(
    concept.generatedContent,
    fallbackCopy(conceptBusiness, tokens),
  );

  const quality = validateConceptForProposal({
    businessName: displayName,
    category: business.category,
    html: concept.generatedHtml,
    hasDesktopShot: true,
    hasMobileShot: true,
  });

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const safeName = pdfSafeText(displayName, business.category || "Business").slice(
    0,
    42,
  );
  const safeCategory = pdfSafeText(business.category, "Business");
  const safeCity = pdfSafeText(business.city, "");
  const safeCountry = pdfSafeText(business.countryName, "");
  const safeAddress = pdfSafeText(
    business.address || `${business.city}, ${business.countryName}`,
    safeCity || "Location",
  );
  const safePhone = pdfSafeText(business.phone || "Not listed publicly", "Not listed publicly");
  const safeEmail = pdfSafeText(
    business.publicEmail || "Not listed publicly",
    "Not listed publicly",
  );
  const safeDegree = pdfSafeText(extras.degree || "", "");
  const safeSpecialty = pdfSafeText(extras.specialty || "", "");

  // First slides = Website Studio desktop view. Last slide = Techlyser branding/contact.
  const capture = await renderConceptHtmlDesktopCapture(concept.generatedHtml);
  let usedStudioHtml = false;

  if (capture?.pngBytes?.byteLength) {
    await appendDesktopWebsitePages(pdf, capture.pngBytes);
    usedStudioHtml = true;
  } else {
    // Fallback only if Chromium/Puppeteer is unavailable.
    const page = pdf.addPage([DESKTOP_PAGE_W, DESKTOP_PAGE_H]);
    drawLandingDesktopPage(page, font, fontBold, tokens, copy, {
      name: safeName,
      category: safeCategory,
      city: safeCity,
      country: safeCountry,
      degree: safeDegree,
      specialty: safeSpecialty,
      phone: safePhone,
      email: safeEmail,
      address: safeAddress,
    });
  }

  drawClosingPage(pdf, font, fontBold, tokens, safeName);

  const bytes = await pdf.save();
  const pdfBase64 = Buffer.from(bytes).toString("base64");

  const proposal = await prisma.businessProposal.create({
    data: {
      businessOpportunityId: business.id,
      conceptId: concept.id,
      pdfBase64,
      proposalStatus: quality.needsReview ? "DRAFT" : "READY",
      generatedAt: new Date(),
    },
  });

  await prisma.businessOpportunity.update({
    where: { id: business.id },
    data: {
      leadStatus: quality.needsReview ? "CONCEPT_READY" : "PROPOSAL_READY",
    },
  });

  return {
    proposal,
    quality,
    conceptId: concept.id,
    usedStudioHtml,
  };
}
