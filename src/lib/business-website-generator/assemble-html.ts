import { escapeHtml, sanitizeConceptHtml } from "@/lib/business-website-generator/sanitize";
import type {
  AssembledConcept,
  ConceptBusiness,
  ConceptCopy,
  DesignTokens,
} from "@/lib/business-website-generator/types";

function hoursText(value: unknown) {
  if (!value) return null;
  if (typeof value === "string" && value.trim()) return value.trim();
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function pickImages(business: ConceptBusiness) {
  const photos = business.assets.filter(
    (a) => a.assetType === "PHOTO" || a.assetType === "OTHER",
  );
  const logos = business.assets.filter((a) => a.assetType === "LOGO");
  return {
    hero: photos[0] || null,
    gallery: photos.slice(0, 6),
    logo: logos[0] || null,
  };
}

function familyNav(family: DesignTokens["family"]) {
  if (family === "clinic") return ["About", "Care", "Contact"];
  if (family === "restaurant") return ["About", "Highlights", "Visit"];
  if (family === "salon") return ["About", "Services", "Book"];
  return ["About", "Services", "Contact"];
}

export function assembleConceptHtml(input: {
  business: ConceptBusiness;
  tokens: DesignTokens;
  copy: ConceptCopy;
}): AssembledConcept {
  const { business, tokens, copy } = input;
  const images = pickImages(business);
  const hours = hoursText(business.openingHours);
  const usedSections = ["nav", "hero", "about", "services", "contact", "footer"];
  const imageNotes: string[] = [];
  const credentials = [business.degree, business.specialty].filter(Boolean).join(" · ");

  if (images.hero) {
    imageNotes.push(
      images.hero.isIllustrative
        ? "Hero uses illustrative stock imagery (not a photo of this business)."
        : "Hero uses a permitted/discovered listing or site image.",
    );
    usedSections.push("hero-image");
  } else {
    imageNotes.push(
      "Hero uses designed gradient/typography placeholder (no reusable photo found).",
    );
  }
  if (images.gallery.length > 1) usedSections.push("gallery");
  if (credentials) usedSections.push("credentials");

  const isDark = tokens.family === "salon" || tokens.family === "fitness";
  const line = isDark ? "rgba(255,255,255,0.12)" : "#e6e9ee";
  const nav = familyNav(tokens.family);

  const heroMedia = images.hero
    ? `<div class="hero-media"><img src="${escapeHtml(images.hero.assetUrl)}" alt="${escapeHtml(images.hero.altText)}" />${
        images.hero.isIllustrative
          ? `<span class="img-note">Illustrative imagery — not a photo of ${escapeHtml(business.displayName || business.businessName)}</span>`
          : ""
      }</div>`
    : `<div class="hero-media placeholder"><div class="placeholder-mark">${escapeHtml(
        ((business.displayName || business.businessName).replace(/[^\p{L}\p{N}]/gu, "").slice(0, 1) || "B").toUpperCase(),
      )}</div><p class="placeholder-cat">${escapeHtml(tokens.label)}</p></div>`;

  const galleryHtml =
    images.gallery.length > 1
      ? `<section class="section" id="gallery">
          <h2>${escapeHtml(copy.galleryTitle)}</h2>
          <div class="gallery">
            ${images.gallery
              .map(
                (img) => `<figure>
                  <img src="${escapeHtml(img.assetUrl)}" alt="${escapeHtml(img.altText)}" loading="lazy" />
                  ${
                    img.isIllustrative
                      ? `<figcaption>Illustrative stock</figcaption>`
                      : `<figcaption>${escapeHtml(img.altText)}</figcaption>`
                  }
                </figure>`,
              )
              .join("")}
          </div>
        </section>`
      : "";

  const html = sanitizeConceptHtml(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(business.displayName || business.businessName)} — website concept</title>
  <style>
    :root {
      --bg: ${tokens.bg};
      --surface: ${tokens.surface};
      --ink: ${tokens.ink};
      --muted: ${tokens.muted};
      --accent: ${tokens.accent};
      --accent-soft: ${tokens.accentSoft};
      --hero: ${tokens.heroGradient};
      --radius: ${tokens.radius};
      --line: ${line};
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ${tokens.fontBody}; color: var(--ink); background: var(--bg); }
    a { color: inherit; text-decoration: none; }
    .wrap { max-width: 1080px; margin: 0 auto; padding: 0 20px; }
    .topbar { display:flex; align-items:center; justify-content:space-between; padding:18px 0; gap:16px; }
    .brand { display:flex; align-items:center; gap:10px; font-weight:700; letter-spacing:-0.02em; }
    .brand img { width:36px; height:36px; border-radius:10px; object-fit:cover; }
    .nav { display:flex; gap:16px; flex-wrap:wrap; font-size:14px; color:var(--muted); }
    .hero {
      display:grid; grid-template-columns:1.1fr 0.9fr; gap:28px; align-items:stretch;
      padding:28px; border-radius:calc(var(--radius) + 8px); background:var(--hero); color:#fff; overflow:hidden;
    }
    .eyebrow { font-size:12px; letter-spacing:0.14em; text-transform:uppercase; color:var(--accent); font-weight:700; }
    .hero h1 { margin:10px 0 8px; font-family:${tokens.fontDisplay}; font-size:clamp(32px,5vw,50px); line-height:1.05; letter-spacing:-0.03em; }
    .cred { display:inline-block; margin:0 0 12px; padding:6px 10px; border-radius:999px; background:rgba(255,255,255,0.12); font-size:12px; }
    .hero p { margin:0; max-width:46ch; color:rgba(255,255,255,0.78); line-height:1.6; }
    .cta { display:inline-block; margin-top:22px; background:var(--accent); color:#fff; font-weight:700; padding:12px 18px; border-radius:12px; }
    .hero-media { position:relative; min-height:280px; border-radius:var(--radius); overflow:hidden; background:rgba(255,255,255,0.06); display:grid; place-items:center; }
    .hero-media img { width:100%; height:100%; object-fit:cover; display:block; min-height:280px; }
    .placeholder-mark { width:96px; height:96px; border-radius:28px; display:grid; place-items:center; background:var(--accent); color:#fff; font-size:42px; font-weight:700; }
    .placeholder-cat { margin:12px 0 0; color:rgba(255,255,255,0.7); font-size:13px; }
    .img-note, figcaption { position:absolute; left:10px; right:10px; bottom:10px; font-size:11px; background:rgba(0,0,0,0.55); color:#fff; padding:6px 8px; border-radius:8px; }
    figure { position:relative; margin:0; }
    .section { padding:48px 0 8px; }
    .section h2 { margin:0 0 16px; font-size:28px; letter-spacing:-0.02em; font-family:${tokens.fontDisplay}; }
    .section p { color:var(--muted); line-height:1.65; max-width:62ch; }
    .cards { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
    .card { background:var(--surface); border:1px solid var(--line); border-radius:var(--radius); padding:18px; min-height:120px; }
    .card strong { display:block; margin-bottom:8px; }
    .card span { color:var(--muted); font-size:14px; line-height:1.5; }
    .gallery { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
    .gallery img { width:100%; height:180px; object-fit:cover; border-radius:14px; display:block; background:var(--accent-soft); }
    .contact-grid { display:grid; grid-template-columns:1.2fr 0.8fr; gap:18px; }
    .panel { background:var(--surface); border:1px solid var(--line); border-radius:var(--radius); padding:18px; }
    .panel dt { font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:var(--muted); }
    .panel dd { margin:4px 0 14px; }
    footer { margin:40px 0 28px; padding-top:18px; border-top:1px solid var(--line); color:var(--muted); font-size:12px; display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; }
    .pitch { margin-top:10px; font-size:12px; color:rgba(255,255,255,0.55); }
    @media (max-width:860px) {
      .hero, .cards, .gallery, .contact-grid { grid-template-columns:1fr; }
      .nav { display:none; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header class="topbar">
      <div class="brand">
        ${images.logo ? `<img src="${escapeHtml(images.logo.assetUrl)}" alt="" />` : ""}
        <span>${escapeHtml(business.displayName || business.businessName)}</span>
      </div>
      <nav class="nav">
        ${nav.map((label, i) => `<a href="#${["about", "services", "contact"][i] || "contact"}">${escapeHtml(label)}</a>`).join("")}
      </nav>
    </header>

    <section class="hero">
      <div>
        <div class="eyebrow">${escapeHtml(copy.heroEyebrow)}</div>
        <h1>${escapeHtml(copy.heroHeadline)}</h1>
        ${credentials ? `<div class="cred">${escapeHtml(credentials)}</div>` : ""}
        <p>${escapeHtml(copy.heroSubhead)}</p>
        <a class="cta" href="${business.phone ? `tel:${escapeHtml(business.phone)}` : "#contact"}">${escapeHtml(copy.primaryCta)}</a>
        <div class="pitch">Concept preview of how your ${escapeHtml(tokens.label.toLowerCase())} website could look</div>
      </div>
      ${heroMedia}
    </section>

    <section class="section" id="about">
      <h2>${escapeHtml(copy.aboutTitle)}</h2>
      <p>${escapeHtml(copy.aboutBody)}</p>
    </section>

    <section class="section" id="services">
      <h2>${escapeHtml(copy.servicesTitle)}</h2>
      <div class="cards">
        ${copy.serviceItems
          .map(
            (item) =>
              `<article class="card"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span></article>`,
          )
          .join("")}
      </div>
    </section>

    ${galleryHtml}

    <section class="section" id="contact">
      <h2>${escapeHtml(copy.contactTitle)}</h2>
      <p>${escapeHtml(copy.contactBody)}</p>
      <div class="contact-grid" style="margin-top:18px">
        <dl class="panel">
          <dt>Name</dt><dd>${escapeHtml(business.displayName || business.businessName)}</dd>
          ${business.degree ? `<dt>Degree / title</dt><dd>${escapeHtml(business.degree)}</dd>` : ""}
          ${business.specialty ? `<dt>Specialty</dt><dd>${escapeHtml(business.specialty)}</dd>` : ""}
          <dt>Category</dt><dd>${escapeHtml(business.category)}</dd>
          <dt>Location</dt><dd>${escapeHtml(business.address || `${business.city}, ${business.countryName}`)}</dd>
          <dt>Phone</dt><dd>${escapeHtml(business.phone || "Not listed publicly")}</dd>
          <dt>Email</dt><dd>${escapeHtml(business.publicEmail || "Not listed publicly")}</dd>
          ${hours ? `<dt>Hours</dt><dd>${escapeHtml(hours)}</dd>` : ""}
        </dl>
        <div class="panel">
          <strong>Next step</strong>
          <p style="margin:10px 0 0;color:var(--muted);font-size:14px;line-height:1.55">
            Techlyser can build this ${escapeHtml(tokens.label.toLowerCase())} website for ${escapeHtml(business.displayName || business.businessName)} using your real branding and photos.
          </p>
        </div>
      </div>
    </section>

    <footer>
      <span>${escapeHtml(copy.footerNote)}</span>
      <span>Prepared by Techlyser</span>
    </footer>
  </div>
</body>
</html>`);

  return {
    conceptTitle: copy.conceptTitle,
    html,
    content: {
      ...copy,
      family: tokens.family,
      usedSections,
      imageNotes,
    },
  };
}
