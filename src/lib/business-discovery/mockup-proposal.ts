import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type MockupBusinessInput = {
  businessName: string;
  category: string;
  categoryGroup?: string | null;
  city: string;
  countryName: string;
  address?: string | null;
  phone?: string | null;
  publicEmail?: string | null;
  websiteUrl?: string | null;
  description?: string | null;
};

const ORANGE = rgb(0.95, 0.45, 0.12);
const BLACK = rgb(0.08, 0.09, 0.11);
const MUTED = rgb(0.42, 0.45, 0.5);
const WHITE = rgb(1, 1, 1);
const SLATE = rgb(0.96, 0.97, 0.98);
const LINE = rgb(0.88, 0.9, 0.92);
const INK = rgb(0.12, 0.14, 0.18);
const ACCENT_SOFT = rgb(1, 0.94, 0.88);

function safe(text: string | null | undefined, fallback = "—") {
  const value = (text || "").trim();
  return value || fallback;
}

function wrap(text: string, max = 70) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function headlineFor(input: MockupBusinessInput) {
  const cat = input.category.toLowerCase();
  if (cat.includes("restaurant") || cat.includes("cafe") || cat.includes("bakery")) {
    return `Taste the best of ${input.city}`;
  }
  if (cat.includes("clinic") || cat.includes("doctor") || cat.includes("dental")) {
    return `Trusted care in ${input.city}`;
  }
  if (cat.includes("salon") || cat.includes("spa") || cat.includes("barber")) {
    return `Look your best, locally`;
  }
  if (cat.includes("gym") || cat.includes("yoga") || cat.includes("fitness")) {
    return `Train with purpose in ${input.city}`;
  }
  return `A modern presence for ${input.businessName}`;
}

function supportingCopy(input: MockupBusinessInput) {
  if (input.description?.trim()) return input.description.trim().slice(0, 220);
  return `${input.businessName} is a ${input.category.toLowerCase()} business serving customers in ${input.city}, ${input.countryName}. This concept shows how a premium website can present your services, location, and contact details clearly.`;
}

function serviceBullets(input: MockupBusinessInput) {
  const base = [
    `Clear ${input.category.toLowerCase()} offer for local customers`,
    `Easy call / enquire path with your public contact details`,
    `Mobile-first layout built for ${input.city} searchers`,
  ];
  if (input.phone) base[1] = `One-tap call to ${input.phone}`;
  return base;
}

/** On-screen HTML mockup of a premium one-page website concept. */
export function buildWebsiteMockupHtml(input: MockupBusinessInput) {
  const services = serviceBullets(input);
  const headline = headlineFor(input);
  const support = supportingCopy(input);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(input.businessName)} — Website concept</title>
  <style>
    :root {
      --ink: #14171c;
      --muted: #5b6470;
      --line: #e6e9ee;
      --bg: #f4f6f8;
      --orange: #f2731f;
      --card: #ffffff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      color: var(--ink);
      background: linear-gradient(180deg, #eceff3 0%, #f7f8fa 40%, #ffffff 100%);
    }
    .frame {
      max-width: 920px;
      margin: 0 auto;
      padding: 18px 14px 40px;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--orange);
      font-weight: 700;
      margin-bottom: 10px;
    }
    .browser {
      border: 1px solid var(--line);
      border-radius: 18px;
      overflow: hidden;
      background: var(--card);
      box-shadow: 0 24px 60px rgba(20, 23, 28, 0.08);
    }
    .chrome {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      background: #fafbfc;
      border-bottom: 1px solid var(--line);
    }
    .dot { width: 9px; height: 9px; border-radius: 50%; background: #d7dbe2; }
    .url {
      flex: 1;
      margin-left: 8px;
      border-radius: 999px;
      background: #eef1f5;
      color: var(--muted);
      font-size: 12px;
      padding: 7px 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .hero {
      padding: 56px 40px 48px;
      background:
        radial-gradient(circle at 85% 15%, rgba(242,115,31,0.18), transparent 35%),
        linear-gradient(135deg, #101218 0%, #1c2430 55%, #243041 100%);
      color: white;
    }
    .hero h1 {
      margin: 0 0 12px;
      font-size: 40px;
      line-height: 1.1;
      letter-spacing: -0.03em;
      max-width: 14ch;
    }
    .hero p {
      margin: 0;
      max-width: 46ch;
      color: rgba(255,255,255,0.78);
      font-size: 16px;
      line-height: 1.55;
    }
    .cta {
      display: inline-block;
      margin-top: 22px;
      background: var(--orange);
      color: white;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 12px 18px;
      border-radius: 12px;
    }
    .meta {
      margin-top: 18px;
      font-size: 12px;
      color: rgba(255,255,255,0.55);
    }
    .section {
      padding: 36px 40px;
      border-top: 1px solid var(--line);
    }
    .section h2 {
      margin: 0 0 14px;
      font-size: 22px;
      letter-spacing: -0.02em;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }
    .card {
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 16px;
      background: var(--bg);
      min-height: 110px;
    }
    .card strong { display: block; margin-bottom: 8px; font-size: 14px; }
    .card span { color: var(--muted); font-size: 13px; line-height: 1.45; }
    .contact {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 18px;
      align-items: start;
    }
    .contact dl { margin: 0; }
    .contact dt { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
    .contact dd { margin: 4px 0 14px; font-size: 14px; }
    .note {
      margin-top: 14px;
      font-size: 12px;
      color: var(--muted);
      text-align: center;
    }
    @media (max-width: 720px) {
      .hero { padding: 40px 22px; }
      .hero h1 { font-size: 30px; }
      .section { padding: 28px 22px; }
      .grid, .contact { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="frame">
    <div class="badge">Techlyser website concept · preview only</div>
    <div class="browser">
      <div class="chrome">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        <div class="url">${escapeHtml(
          input.websiteUrl ||
            `www.${slugify(input.businessName)}.com · concept mockup`,
        )}</div>
      </div>
      <section class="hero">
        <div class="badge" style="color:#ffb48a">${escapeHtml(input.category)} · ${escapeHtml(input.city)}</div>
        <h1>${escapeHtml(input.businessName)}</h1>
        <p>${escapeHtml(headline)}. ${escapeHtml(support)}</p>
        <a class="cta" href="#contact">${input.phone ? `Call ${escapeHtml(input.phone)}` : "Enquire now"}</a>
        <div class="meta">Concept mockup · not a live website · prepared by Techlyser</div>
      </section>
      <section class="section">
        <h2>Why this layout works</h2>
        <div class="grid">
          ${services
            .map(
              (item, i) => `<div class="card"><strong>0${i + 1}</strong><span>${escapeHtml(item)}</span></div>`,
            )
            .join("")}
        </div>
      </section>
      <section class="section" id="contact">
        <h2>Visit & contact</h2>
        <div class="contact">
          <dl>
            <dt>Location</dt>
            <dd>${escapeHtml(safe(input.address, `${input.city}, ${input.countryName}`))}</dd>
            <dt>Phone</dt>
            <dd>${escapeHtml(safe(input.phone, "Add your business phone"))}</dd>
            <dt>Email</dt>
            <dd>${escapeHtml(safe(input.publicEmail, "Not listed publicly yet"))}</dd>
          </dl>
          <div class="card">
            <strong>Next step</strong>
            <span>Approve this concept and Techlyser can build the real site with your branding, photos, and services.</span>
          </div>
        </div>
      </section>
    </div>
    <p class="note">Generated from public listing details only. No email is sent automatically.</p>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24) || "business";
}

/** Multi-page branded PDF with desktop + mobile website mockups. */
export async function buildWebsiteMockupPdfBase64(input: MockupBusinessInput) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageW = 595;
  const pageH = 842;
  const services = serviceBullets(input);
  const headline = headlineFor(input);
  const support = supportingCopy(input);

  // Cover
  {
    const page = pdf.addPage([pageW, pageH]);
    page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: BLACK });
    page.drawRectangle({
      x: 0,
      y: pageH - 8,
      width: pageW,
      height: 8,
      color: ORANGE,
    });
    page.drawText("TECHLYSER", {
      x: 48,
      y: pageH - 70,
      size: 12,
      font: fontBold,
      color: ORANGE,
    });
    page.drawText("Premium website concept", {
      x: 48,
      y: pageH - 110,
      size: 22,
      font: fontBold,
      color: WHITE,
    });
    page.drawText(input.businessName.slice(0, 42), {
      x: 48,
      y: pageH - 150,
      size: 28,
      font: fontBold,
      color: WHITE,
    });
    page.drawText(`${input.category} · ${input.city}, ${input.countryName}`.slice(0, 70), {
      x: 48,
      y: pageH - 180,
      size: 12,
      font,
      color: rgb(0.7, 0.73, 0.78),
    });
    let y = pageH - 230;
    for (const line of wrap(support, 78).slice(0, 5)) {
      page.drawText(line, { x: 48, y, size: 11, font, color: rgb(0.82, 0.84, 0.88) });
      y -= 16;
    }
    page.drawText("Preview only · not emailed automatically", {
      x: 48,
      y: 48,
      size: 10,
      font,
      color: MUTED,
    });
  }

  // Desktop mockup
  {
    const page = pdf.addPage([pageW, pageH]);
    page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: SLATE });
    page.drawText("DESKTOP WEBSITE MOCKUP", {
      x: 40,
      y: pageH - 40,
      size: 10,
      font: fontBold,
      color: ORANGE,
    });
    page.drawText(input.businessName.slice(0, 50), {
      x: 40,
      y: pageH - 62,
      size: 16,
      font: fontBold,
      color: INK,
    });

    // Browser chrome
    const frameX = 36;
    const frameY = 70;
    const frameW = pageW - 72;
    const frameH = pageH - 150;
    page.drawRectangle({
      x: frameX,
      y: frameY,
      width: frameW,
      height: frameH,
      color: WHITE,
      borderColor: LINE,
      borderWidth: 1,
    });
    page.drawRectangle({
      x: frameX,
      y: frameY + frameH - 28,
      width: frameW,
      height: 28,
      color: rgb(0.98, 0.98, 0.99),
    });
    page.drawCircle({ x: frameX + 14, y: frameY + frameH - 14, size: 3.5, color: rgb(0.8, 0.82, 0.85) });
    page.drawCircle({ x: frameX + 26, y: frameY + frameH - 14, size: 3.5, color: rgb(0.8, 0.82, 0.85) });
    page.drawCircle({ x: frameX + 38, y: frameY + frameH - 14, size: 3.5, color: rgb(0.8, 0.82, 0.85) });
    page.drawRectangle({
      x: frameX + 54,
      y: frameY + frameH - 21,
      width: frameW - 70,
      height: 14,
      color: rgb(0.93, 0.94, 0.96),
    });

    // Hero block
    const heroH = 180;
    page.drawRectangle({
      x: frameX + 1,
      y: frameY + frameH - 28 - heroH,
      width: frameW - 2,
      height: heroH,
      color: rgb(0.1, 0.12, 0.16),
    });
    page.drawRectangle({
      x: frameX + frameW - 120,
      y: frameY + frameH - 70,
      width: 70,
      height: 70,
      color: ACCENT_SOFT,
    });
    page.drawText(input.category.toUpperCase().slice(0, 28), {
      x: frameX + 24,
      y: frameY + frameH - 58,
      size: 8,
      font: fontBold,
      color: ORANGE,
    });
    page.drawText(input.businessName.slice(0, 34), {
      x: frameX + 24,
      y: frameY + frameH - 88,
      size: 18,
      font: fontBold,
      color: WHITE,
    });
    let hy = frameY + frameH - 112;
    for (const line of wrap(headline, 48).slice(0, 2)) {
      page.drawText(line, { x: frameX + 24, y: hy, size: 11, font, color: rgb(0.8, 0.83, 0.88) });
      hy -= 14;
    }
    page.drawRectangle({
      x: frameX + 24,
      y: frameY + frameH - 28 - heroH + 24,
      width: 110,
      height: 22,
      color: ORANGE,
    });
    page.drawText(input.phone ? "Call now" : "Enquire", {
      x: frameX + 48,
      y: frameY + frameH - 28 - heroH + 31,
      size: 10,
      font: fontBold,
      color: WHITE,
    });

    // Service cards
    let cardY = frameY + frameH - 28 - heroH - 90;
    page.drawText("Featured services", {
      x: frameX + 24,
      y: cardY + 58,
      size: 12,
      font: fontBold,
      color: INK,
    });
    const cardW = (frameW - 64) / 3;
    services.forEach((service, index) => {
      const x = frameX + 24 + index * (cardW + 8);
      page.drawRectangle({
        x,
        y: cardY,
        width: cardW,
        height: 70,
        color: SLATE,
        borderColor: LINE,
        borderWidth: 1,
      });
      page.drawText(`0${index + 1}`, {
        x: x + 10,
        y: cardY + 48,
        size: 10,
        font: fontBold,
        color: ORANGE,
      });
      let sy = cardY + 32;
      for (const line of wrap(service, 22).slice(0, 3)) {
        page.drawText(line, { x: x + 10, y: sy, size: 8, font, color: MUTED });
        sy -= 11;
      }
    });

    // Contact strip
    page.drawRectangle({
      x: frameX + 1,
      y: frameY + 1,
      width: frameW - 2,
      height: 56,
      color: rgb(0.98, 0.98, 0.99),
    });
    page.drawText(`Phone: ${safe(input.phone)}`.slice(0, 40), {
      x: frameX + 20,
      y: frameY + 32,
      size: 9,
      font,
      color: INK,
    });
    page.drawText(`Email: ${safe(input.publicEmail, "Not listed publicly")}`.slice(0, 48), {
      x: frameX + 20,
      y: frameY + 18,
      size: 9,
      font,
      color: MUTED,
    });
    page.drawText(
      `Location: ${safe(input.address, `${input.city}, ${input.countryName}`)}`.slice(0, 55),
      {
        x: frameX + 250,
        y: frameY + 25,
        size: 9,
        font,
        color: MUTED,
      },
    );
  }

  // Mobile mockup
  {
    const page = pdf.addPage([pageW, pageH]);
    page.drawRectangle({ x: 0, y: 0, width: pageW, height: pageH, color: SLATE });
    page.drawText("MOBILE WEBSITE MOCKUP", {
      x: 40,
      y: pageH - 40,
      size: 10,
      font: fontBold,
      color: ORANGE,
    });
    page.drawText("Designed for local customers on their phones", {
      x: 40,
      y: pageH - 62,
      size: 14,
      font: fontBold,
      color: INK,
    });

    const phoneW = 220;
    const phoneH = 430;
    const phoneX = (pageW - phoneW) / 2;
    const phoneY = 120;
    page.drawRectangle({
      x: phoneX,
      y: phoneY,
      width: phoneW,
      height: phoneH,
      color: BLACK,
      borderColor: BLACK,
      borderWidth: 1,
    });
    page.drawRectangle({
      x: phoneX + 8,
      y: phoneY + 8,
      width: phoneW - 16,
      height: phoneH - 16,
      color: WHITE,
    });
    page.drawRectangle({
      x: phoneX + 8,
      y: phoneY + phoneH - 120,
      width: phoneW - 16,
      height: 112,
      color: rgb(0.1, 0.12, 0.16),
    });
    page.drawText(input.businessName.slice(0, 22), {
      x: phoneX + 20,
      y: phoneY + phoneH - 50,
      size: 12,
      font: fontBold,
      color: WHITE,
    });
    page.drawText(headline.slice(0, 28), {
      x: phoneX + 20,
      y: phoneY + phoneH - 70,
      size: 9,
      font,
      color: rgb(0.8, 0.83, 0.88),
    });
    page.drawRectangle({
      x: phoneX + 20,
      y: phoneY + phoneH - 108,
      width: 90,
      height: 18,
      color: ORANGE,
    });
    page.drawText(input.phone ? "Call" : "Enquire", {
      x: phoneX + 48,
      y: phoneY + phoneH - 102,
      size: 9,
      font: fontBold,
      color: WHITE,
    });

    let my = phoneY + phoneH - 150;
    for (const service of services) {
      page.drawRectangle({
        x: phoneX + 16,
        y: my - 36,
        width: phoneW - 32,
        height: 40,
        color: SLATE,
        borderColor: LINE,
        borderWidth: 1,
      });
      page.drawText(service.slice(0, 34), {
        x: phoneX + 24,
        y: my - 18,
        size: 8,
        font,
        color: INK,
      });
      my -= 48;
    }

    page.drawText(safe(input.phone, "Add phone number"), {
      x: phoneX + 20,
      y: phoneY + 28,
      size: 9,
      font: fontBold,
      color: ORANGE,
    });
    page.drawText(`${input.city}, ${input.countryName}`.slice(0, 32), {
      x: phoneX + 20,
      y: phoneY + 14,
      size: 8,
      font,
      color: MUTED,
    });
  }

  // Closing / next steps
  {
    const page = pdf.addPage([pageW, pageH]);
    page.drawText("NEXT STEPS", {
      x: 48,
      y: pageH - 70,
      size: 10,
      font: fontBold,
      color: ORANGE,
    });
    page.drawText("Ready when you are", {
      x: 48,
      y: pageH - 100,
      size: 22,
      font: fontBold,
      color: INK,
    });
    const steps = [
      "Review this concept with your team.",
      "Share logo, photos, and service list (optional).",
      "Techlyser builds the live website from this direction.",
      "Email outreach stays manual — nothing is auto-sent.",
    ];
    let y = pageH - 150;
    steps.forEach((step, index) => {
      page.drawText(`${index + 1}. ${step}`, {
        x: 48,
        y,
        size: 12,
        font,
        color: INK,
      });
      y -= 28;
    });
    page.drawRectangle({
      x: 48,
      y: y - 90,
      width: pageW - 96,
      height: 80,
      color: ACCENT_SOFT,
    });
    page.drawText("Prepared by Techlyser", {
      x: 64,
      y: y - 40,
      size: 12,
      font: fontBold,
      color: INK,
    });
    page.drawText("info@techlyser.com · Draft proposal preview", {
      x: 64,
      y: y - 58,
      size: 10,
      font,
      color: MUTED,
    });
  }

  const bytes = await pdf.save();
  return Buffer.from(bytes).toString("base64");
}
