/**
 * Generates modern category landing HTML templates into public/templates/business-landing/
 * Run: node scripts/generate-category-templates.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), "public", "templates", "business-landing");
mkdirSync(outDir, { recursive: true });

const PLACEHOLDERS = [
  "BUSINESS_NAME",
  "CATEGORY",
  "CITY",
  "SPECIALTY",
  "PHONE",
  "EMAIL",
  "ADDRESS",
  "HOURS",
  "ABOUT_SHORT",
  "ABOUT_LONG",
  "SERVICE_1",
  "SERVICE_2",
  "SERVICE_3",
  "HERO_IMAGE",
  "ABOUT_IMAGE",
  "GALLERY_1",
  "GALLERY_2",
  "GALLERY_3",
  "GALLERY_4",
  "GALLERY_5",
];

function demoScript(demo) {
  const demoJson = JSON.stringify(demo, null, 2);
  return `
  <script>
    (function fillDemoIfNeeded() {
      if (window.__CATEGORY_TEMPLATE_FILLED__) return;
      var demo = ${demoJson};
      if (!document.body.innerHTML.includes("{{" + "BUSINESS_NAME}}")) {
        bindImageFallbacks();
        return;
      }
      window.__CATEGORY_TEMPLATE_FILLED__ = true;
      function apply(str) {
        var out = str;
        Object.keys(demo).forEach(function (key) {
          out = out.split("{{" + key + "}}").join(demo[key]);
        });
        return out;
      }
      document.title = apply(document.title);
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", apply(meta.getAttribute("content") || ""));
      document.body.innerHTML = apply(document.body.innerHTML);
      bindImageFallbacks();
    })();

    function bindImageFallbacks() {
      var SAFE =
        "data:image/svg+xml," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#333"/><stop offset="1" stop-color="#666"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><text x="600" y="410" text-anchor="middle" fill="#fff" font-family="Arial" font-size="32">Photo</text></svg>'
        );
      document.querySelectorAll("img.js-img, img[data-fallback]").forEach(function (img) {
        img.addEventListener("error", function onErr() {
          img.removeEventListener("error", onErr);
          var next = img.getAttribute("data-fallback");
          if (next && img.src !== next) {
            img.src = next;
            return;
          }
          img.src = SAFE;
        });
      });
    }
  </script>`;
}

function baseCss(vars) {
  return `
    :root {
      --ink: ${vars.ink};
      --ink-soft: ${vars.inkSoft};
      --muted: ${vars.muted};
      --line: ${vars.line};
      --bg: ${vars.bg};
      --surface: ${vars.surface};
      --accent: ${vars.accent};
      --accent-2: ${vars.accent2};
      --accent-soft: ${vars.accentSoft};
      --warm: ${vars.warm};
      --shadow: ${vars.shadow};
      --radius: 22px;
      --max: 1120px;
      --topbar-bg: ${vars.topbarBg};
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: ${vars.bodyFont};
      color: var(--ink);
      background: ${vars.bodyBg};
      line-height: 1.55;
    }
    img { max-width: 100%; display: block; }
    a { color: inherit; text-decoration: none; }
    .wrap { width: min(var(--max), calc(100% - 2rem)); margin-inline: auto; }
    @keyframes rise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes floaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes pulseSoft { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
    .anim { opacity: 0; animation: rise 0.8s ease forwards; }
    .delay-1 { animation-delay: 0.12s; }
    .delay-2 { animation-delay: 0.24s; }
    .delay-3 { animation-delay: 0.36s; }
    .delay-4 { animation-delay: 0.48s; }
    .topbar {
      position: sticky; top: 0; z-index: 40;
      backdrop-filter: blur(14px);
      background: var(--topbar-bg);
      border-bottom: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
    }
    .topbar-inner {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.9rem 0;
    }
    .brand { display: flex; align-items: center; gap: 0.75rem; font-weight: 700; letter-spacing: -0.02em; }
    .brand-mark {
      width: 42px; height: 42px; border-radius: 14px;
      background: linear-gradient(145deg, var(--accent), var(--accent-2));
      display: grid; place-items: center; color: white;
      box-shadow: 0 10px 24px color-mix(in srgb, var(--accent) 28%, transparent);
    }
    .brand-mark svg { width: 22px; height: 22px; }
    .nav { display: flex; gap: 1.25rem; color: var(--muted); font-size: 0.95rem; font-weight: 500; }
    .nav a:hover { color: var(--accent); }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      border: 0; border-radius: 999px; padding: 0.85rem 1.25rem;
      font-weight: 700; font-size: 0.95rem; cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }
    .btn svg { width: 18px; height: 18px; }
    .btn-primary {
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: ${vars.btnText || "#fff"};
      box-shadow: 0 12px 28px color-mix(in srgb, var(--accent) 28%, transparent);
    }
    .btn-primary:hover { transform: translateY(-2px); }
    .btn-ghost {
      background: var(--surface); color: var(--ink); border: 1px solid var(--line);
    }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
    .hero {
      display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 2.5rem;
      align-items: center; padding: 3.5rem 0 2.5rem;
    }
    .eyebrow {
      display: inline-flex; align-items: center; gap: 0.45rem;
      padding: 0.4rem 0.8rem; border-radius: 999px;
      background: var(--accent-soft); color: var(--accent);
      font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    }
    .eyebrow svg { width: 14px; height: 14px; }
    h1 {
      margin: 1rem 0 0.75rem;
      font-family: ${vars.displayFont};
      font-size: clamp(2.4rem, 5vw, 3.6rem);
      line-height: 1.05; letter-spacing: -0.03em; color: var(--ink);
    }
    .chip {
      display: inline-block; background: var(--surface); border: 1px solid var(--line);
      border-radius: 999px; padding: 0.35rem 0.75rem; font-size: 0.85rem;
      color: var(--ink-soft); font-weight: 600; margin: 0.25rem 0.35rem 0.25rem 0;
    }
    .lead { margin: 0; max-width: 38rem; color: var(--muted); font-size: 1.05rem; }
    .hero-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.6rem; }
    .trust-row {
      display: flex; flex-wrap: wrap; gap: 1.25rem; margin-top: 1.75rem;
      color: var(--muted); font-size: 0.9rem;
    }
    .trust-item { display: inline-flex; align-items: center; gap: 0.45rem; }
    .trust-item svg { width: 18px; height: 18px; color: var(--accent-2); }
    .hero-visual { position: relative; min-height: 460px; }
    .hero-card {
      position: relative; border-radius: 28px; overflow: hidden;
      box-shadow: var(--shadow); background: var(--ink); height: 100%; min-height: 460px;
    }
    .hero-card img {
      width: 100%; height: 100%; object-fit: cover; min-height: 460px;
      transform: scale(1.02); animation: fade 1.1s ease both;
    }
    .float-card {
      position: absolute; left: -18px; bottom: 28px; width: min(250px, 70%);
      background: color-mix(in srgb, var(--surface) 94%, transparent);
      backdrop-filter: blur(10px); border: 1px solid color-mix(in srgb, var(--surface) 70%, transparent);
      border-radius: 18px; padding: 1rem; box-shadow: var(--shadow);
      animation: floaty 5s ease-in-out infinite;
    }
    .float-card strong { display: block; font-size: 0.95rem; margin-bottom: 0.2rem; }
    .float-card span { color: var(--muted); font-size: 0.85rem; }
    section { padding: 3.5rem 0; }
    .section-head { display: grid; gap: 0.6rem; margin-bottom: 1.75rem; max-width: 40rem; }
    .section-head h2 {
      margin: 0; font-family: ${vars.displayFont};
      font-size: clamp(1.8rem, 3vw, 2.4rem); letter-spacing: -0.02em; line-height: 1.15;
    }
    .section-head p { margin: 0; color: var(--muted); }
    .about-grid {
      display: grid; grid-template-columns: 0.95fr 1.05fr; gap: 1.5rem; align-items: stretch;
    }
    .photo-panel {
      border-radius: var(--radius); overflow: hidden; min-height: 360px;
      box-shadow: var(--shadow); position: relative;
    }
    .photo-panel img { width: 100%; height: 100%; object-fit: cover; min-height: 360px; }
    .about-copy {
      background: var(--surface); border: 1px solid var(--line);
      border-radius: var(--radius); padding: 1.6rem; box-shadow: var(--shadow);
    }
    .about-copy p { color: var(--muted); margin-top: 0.75rem; }
    .highlights {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.5rem;
    }
    .highlight {
      padding: 1rem; border-radius: 16px; background: var(--accent-soft);
      border: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
    }
    .highlight strong { display: block; margin-bottom: 0.25rem; }
    .highlight span { color: var(--muted); font-size: 0.9rem; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .card {
      background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
      padding: 1.35rem; box-shadow: 0 10px 30px color-mix(in srgb, var(--ink) 5%, transparent);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .card:hover { transform: translateY(-4px); box-shadow: var(--shadow); }
    .icon-bubble {
      width: 48px; height: 48px; border-radius: 16px; background: var(--accent-soft);
      color: var(--accent); display: grid; place-items: center; margin-bottom: 1rem;
    }
    .icon-bubble svg { width: 24px; height: 24px; }
    .card h3 { margin: 0 0 0.45rem; font-size: 1.1rem; letter-spacing: -0.01em; }
    .card p { margin: 0; color: var(--muted); font-size: 0.95rem; }
    .gallery {
      display: grid; grid-template-columns: 1.3fr 1fr 1fr; grid-template-rows: 180px 180px; gap: 0.85rem;
    }
    .gallery figure {
      margin: 0; border-radius: 18px; overflow: hidden; position: relative; box-shadow: var(--shadow);
    }
    .gallery figure:first-child { grid-row: 1 / span 2; }
    .gallery img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    .gallery figure:hover img { transform: scale(1.05); }
    .gallery figcaption {
      position: absolute; left: 0.7rem; bottom: 0.7rem;
      background: color-mix(in srgb, var(--ink) 62%, transparent); color: white;
      font-size: 0.75rem; padding: 0.3rem 0.55rem; border-radius: 999px;
    }
    .steps {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
    }
    .step {
      background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
      padding: 1.35rem; position: relative;
    }
    .step-num {
      width: 36px; height: 36px; border-radius: 12px; background: var(--accent);
      color: ${vars.btnText || "#fff"}; display: grid; place-items: center;
      font-weight: 700; margin-bottom: 0.85rem; animation: pulseSoft 3.5s ease-in-out infinite;
    }
    .step h3 { margin: 0 0 0.4rem; font-size: 1.05rem; }
    .step p { margin: 0; color: var(--muted); font-size: 0.92rem; }
    .contact-panel {
      display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 1rem;
      background: ${vars.contactGradient};
      color: white; border-radius: 28px; padding: 1.6rem; box-shadow: var(--shadow);
      overflow: hidden; position: relative;
    }
    .contact-panel::after {
      content: ""; position: absolute; width: 280px; height: 280px; right: -60px; bottom: -80px;
      border-radius: 50%; background: rgba(255,255,255,0.08);
    }
    .contact-panel h2 {
      margin: 0 0 0.5rem; font-family: ${vars.displayFont};
      font-size: clamp(1.7rem, 3vw, 2.2rem);
    }
    .contact-panel p { margin: 0; color: rgba(255,255,255,0.8); max-width: 36rem; }
    .facts { display: grid; gap: 0.85rem; margin-top: 1.4rem; position: relative; z-index: 1; }
    .fact { display: grid; grid-template-columns: 40px 1fr; gap: 0.75rem; align-items: start; }
    .fact-icon {
      width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.12);
      display: grid; place-items: center;
    }
    .fact-icon svg { width: 20px; height: 20px; }
    .fact strong { display: block; font-size: 0.8rem; opacity: 0.75; font-weight: 600; }
    .fact span { font-size: 1rem; font-weight: 600; }
    .cta-box {
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18);
      border-radius: 20px; padding: 1.25rem; align-self: center; position: relative; z-index: 1;
    }
    .cta-box .btn-primary {
      width: 100%; margin-top: 0.85rem; background: white; color: var(--ink); box-shadow: none;
    }
    footer {
      padding: 2rem 0 2.5rem; color: var(--muted); font-size: 0.88rem;
      display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
      border-top: 1px solid var(--line); margin-top: 1rem;
    }
    .template-note {
      margin: 0 auto 1rem; width: min(var(--max), calc(100% - 2rem));
      background: var(--warm); border: 1px solid color-mix(in srgb, var(--warm) 60%, #000);
      color: #6a553d; border-radius: 14px; padding: 0.75rem 1rem; font-size: 0.85rem;
    }
    @media (max-width: 900px) {
      .nav { display: none; }
      .hero, .about-grid, .cards, .contact-panel, .gallery, .highlights, .steps {
        grid-template-columns: 1fr;
      }
      .gallery { grid-template-rows: 220px 160px 160px; }
      .gallery figure:first-child { grid-row: auto; }
      .hero-visual, .hero-card, .hero-card img { min-height: 340px; }
      .float-card { left: 12px; bottom: 12px; }
    }
  `;
}

const phoneIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h2a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9z" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const pinIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-4.4-7-10a7 7 0 0 1 14 0c0 5.6-7 10-7 10z" stroke-linejoin="round"/><circle cx="12" cy="11" r="2.2"/></svg>`;
const mailIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8l8 5 8-5"/><rect x="4" y="5" width="16" height="14" rx="2"/></svg>`;
const clockIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/></svg>`;
const shieldIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-linejoin="round"/></svg>`;
const userIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" stroke-linecap="round"/></svg>`;

function img(srcKey, fallback, alt, w, h, cls = "js-img") {
  return `<img class="${cls}" src="{{${srcKey}}}" data-fallback="${fallback}" alt="${alt}" width="${w}" height="${h}" />`;
}

function buildTemplate(t) {
  const fontsLink = t.fontsLink;
  const css = baseCss(t.vars);
  const demo = {
    ...t.demo,
    HERO_IMAGE: t.images.hero,
    ABOUT_IMAGE: t.images.about,
    GALLERY_1: t.images.g1,
    GALLERY_2: t.images.g2,
    GALLERY_3: t.images.g3,
    GALLERY_4: t.images.g4,
    GALLERY_5: t.images.g5,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{{BUSINESS_NAME}} | ${t.titleSuffix}</title>
  <meta name="description" content="{{BUSINESS_NAME}} — {{CATEGORY}} in {{CITY}}." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${fontsLink}" rel="stylesheet" />
  <style>${css}</style>
</head>
<body>
  <p class="template-note">
    ${t.label} landing template — placeholders fill from scrap lead data. Images use listing photos when available; otherwise stock placeholders.
  </p>

  <header class="topbar">
    <div class="wrap topbar-inner">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">${t.brandIcon}</div>
        <span>{{BUSINESS_NAME}}</span>
      </div>
      <nav class="nav" aria-label="Primary">
        <a href="#about">About</a>
        <a href="#services">Services</a>
        <a href="#process">Process</a>
        <a href="#gallery">Gallery</a>
        <a href="#contact">Contact</a>
      </nav>
      <a class="btn btn-primary" href="tel:{{PHONE}}">${phoneIcon} Call now</a>
    </div>
  </header>

  <main>
    <!-- 1. Hero -->
    <section class="wrap hero">
      <div>
        <div class="eyebrow anim">${pinIcon} {{CATEGORY}} · {{CITY}}</div>
        <h1 class="anim delay-1">{{BUSINESS_NAME}}</h1>
        <div class="anim delay-1">
          <span class="chip">{{SPECIALTY}}</span>
          <span class="chip">{{CITY}}</span>
        </div>
        <p class="lead anim delay-2">{{ABOUT_SHORT}}</p>
        <div class="hero-actions anim delay-3">
          <a class="btn btn-primary" href="tel:{{PHONE}}">${phoneIcon} Call {{PHONE}}</a>
          <a class="btn btn-ghost" href="#contact">${mailIcon} View contact</a>
        </div>
        <div class="trust-row anim delay-4">
          <div class="trust-item">${shieldIcon} ${t.trust1}</div>
          <div class="trust-item">${clockIcon} {{HOURS}}</div>
        </div>
      </div>
      <div class="hero-visual anim delay-2">
        <div class="hero-card">
          ${img("HERO_IMAGE", t.images.hero, t.heroAlt, 800, 1000)}
          <div class="float-card">
            <strong>{{SPECIALTY}}</strong>
            <span>${t.floatText}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. About -->
    <section class="wrap" id="about">
      <div class="section-head anim">
        <h2>${t.aboutTitle}</h2>
        <p>${t.aboutSub}</p>
      </div>
      <div class="about-grid">
        <div class="photo-panel anim delay-1">
          ${img("ABOUT_IMAGE", t.images.about, t.aboutAlt, 900, 700)}
        </div>
        <div class="about-copy anim delay-2">
          <div class="eyebrow">{{CATEGORY}}</div>
          <h2 style="margin:0.8rem 0 0;font-family:inherit;font-size:1.8rem;letter-spacing:-0.02em;">${t.aboutHeadline}</h2>
          <p>{{ABOUT_LONG}}</p>
          <div class="highlights">
            <div class="highlight"><strong>${t.h1t}</strong><span>${t.h1b}</span></div>
            <div class="highlight"><strong>${t.h2t}</strong><span>${t.h2b}</span></div>
            <div class="highlight"><strong>${t.h3t}</strong><span>${t.h3b}</span></div>
          </div>
          <div class="hero-actions">
            <a class="btn btn-primary" href="tel:{{PHONE}}">${t.aboutCta}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Services -->
    <section class="wrap" id="services">
      <div class="section-head anim">
        <h2>${t.servicesTitle}</h2>
        <p>${t.servicesSub}</p>
      </div>
      <div class="cards">
        <article class="card anim delay-1">
          <div class="icon-bubble" aria-hidden="true">${t.s1icon}</div>
          <h3>{{SERVICE_1}}</h3>
          <p>${t.s1body}</p>
        </article>
        <article class="card anim delay-2">
          <div class="icon-bubble" aria-hidden="true">${t.s2icon}</div>
          <h3>{{SERVICE_2}}</h3>
          <p>${t.s2body}</p>
        </article>
        <article class="card anim delay-3">
          <div class="icon-bubble" aria-hidden="true">${t.s3icon}</div>
          <h3>{{SERVICE_3}}</h3>
          <p>${t.s3body}</p>
        </article>
      </div>
    </section>

    <!-- 4. Process -->
    <section class="wrap" id="process">
      <div class="section-head anim">
        <h2>${t.processTitle}</h2>
        <p>${t.processSub}</p>
      </div>
      <div class="steps">
        <div class="step anim delay-1">
          <div class="step-num">1</div>
          <h3>${t.p1t}</h3>
          <p>${t.p1b}</p>
        </div>
        <div class="step anim delay-2">
          <div class="step-num">2</div>
          <h3>${t.p2t}</h3>
          <p>${t.p2b}</p>
        </div>
        <div class="step anim delay-3">
          <div class="step-num">3</div>
          <h3>${t.p3t}</h3>
          <p>${t.p3b}</p>
        </div>
      </div>
    </section>

    <!-- 5. Gallery -->
    <section class="wrap" id="gallery">
      <div class="section-head anim">
        <h2>${t.galleryTitle}</h2>
        <p>${t.gallerySub}</p>
      </div>
      <div class="gallery anim delay-1">
        <figure>${img("GALLERY_1", t.images.g1, "Gallery 1", 900, 1200)}<figcaption>${t.g1cap}</figcaption></figure>
        <figure>${img("GALLERY_2", t.images.g2, "Gallery 2", 700, 500)}<figcaption>${t.g2cap}</figcaption></figure>
        <figure>${img("GALLERY_3", t.images.g3, "Gallery 3", 700, 500)}<figcaption>${t.g3cap}</figcaption></figure>
        <figure>${img("GALLERY_4", t.images.g4, "Gallery 4", 700, 500)}<figcaption>${t.g4cap}</figcaption></figure>
        <figure>${img("GALLERY_5", t.images.g5, "Gallery 5", 700, 500)}<figcaption>${t.g5cap}</figcaption></figure>
      </div>
    </section>

    <!-- 6. Contact -->
    <section class="wrap" id="contact">
      <div class="contact-panel anim">
        <div>
          <h2>Visit &amp; contact</h2>
          <p>Everything a customer needs to reach {{BUSINESS_NAME}} — from public listing details.</p>
          <div class="facts">
            <div class="fact">
              <div class="fact-icon">${userIcon}</div>
              <div><strong>Business</strong><span>{{BUSINESS_NAME}}</span></div>
            </div>
            <div class="fact">
              <div class="fact-icon">${t.brandIcon}</div>
              <div><strong>Focus</strong><span>{{SPECIALTY}}</span></div>
            </div>
            <div class="fact">
              <div class="fact-icon">${phoneIcon}</div>
              <div><strong>Phone</strong><span>{{PHONE}}</span></div>
            </div>
            <div class="fact">
              <div class="fact-icon">${mailIcon}</div>
              <div><strong>Email</strong><span>{{EMAIL}}</span></div>
            </div>
            <div class="fact">
              <div class="fact-icon">${pinIcon}</div>
              <div><strong>Location</strong><span>{{ADDRESS}}, {{CITY}}</span></div>
            </div>
            <div class="fact">
              <div class="fact-icon">${clockIcon}</div>
              <div><strong>Hours</strong><span>{{HOURS}}</span></div>
            </div>
          </div>
        </div>
        <div class="cta-box">
          <strong style="font-size:1.15rem;display:block;margin-bottom:0.35rem;">${t.ctaTitle}</strong>
          <span style="opacity:0.85;font-size:0.95rem;">${t.ctaBody}</span>
          <a class="btn btn-primary" href="tel:{{PHONE}}">${phoneIcon} {{PHONE}}</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="wrap">
    <span>Website concept for {{BUSINESS_NAME}} · {{CITY}}</span>
    <span>Prepared by Techlyser · template preview</span>
  </footer>
  ${demoScript(demo)}
</body>
</html>`;
}

const scissors = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" stroke-linecap="round"/></svg>`;
const fork = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const bag = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0" stroke-linecap="round"/></svg>`;
const dumbbell = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11" stroke-linecap="round"/></svg>`;
const briefcase = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M12 12v.01"/></svg>`;
const wrench = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
const spark = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" stroke-linejoin="round"/></svg>`;
const star = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7z" stroke-linejoin="round"/></svg>`;
const check = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const leaf = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`;
const home = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>`;

const templates = [
  {
    file: "salon.html",
    label: "Salon / beauty",
    titleSuffix: "Salon",
    fontsLink:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=Outfit:wght@400;500;600;700&display=swap",
    vars: {
      ink: "#f4f1ea",
      inkSoft: "#e7e0d4",
      muted: "#a8a29a",
      line: "#2a241c",
      bg: "#111214",
      surface: "#1a1c20",
      accent: "#d4a373",
      accent2: "#c08b55",
      accentSoft: "#2a241c",
      warm: "#2a241c",
      shadow: "0 18px 50px rgba(0,0,0,0.35)",
      topbarBg: "rgba(17,18,20,0.88)",
      bodyFont: "Outfit, system-ui, sans-serif",
      displayFont: "'Cormorant Garamond', Georgia, serif",
      bodyBg:
        "radial-gradient(1000px 500px at 90% -10%, rgba(212,163,115,0.18), transparent 55%), radial-gradient(800px 400px at -10% 30%, rgba(192,139,85,0.1), transparent 50%), #111214",
      contactGradient: "linear-gradient(145deg, #0b0b0c, #1c1a17 55%, #2b241c)",
      btnText: "#111214",
    },
    brandIcon: scissors,
    trust1: "Styled with care",
    floatText: "Appointments in {{CITY}}",
    heroAlt: "Salon styling chair and mirrors",
    aboutAlt: "Hair styling session",
    aboutTitle: "About the salon",
    aboutSub: "A polished digital front for your chair, team, and booking call.",
    aboutHeadline: "Looks that feel intentional",
    aboutCta: "Book by phone",
    h1t: "Cut & finish",
    h1b: "Clear service presentation",
    h2t: "Local clients",
    h2b: "Easy to find in {{CITY}}",
    h3t: "Direct call",
    h3b: "One-tap booking line",
    servicesTitle: "Signature services",
    servicesSub: "Highlight what walk-in and booked clients come for.",
    s1icon: scissors,
    s1body: "Listed hair and grooming services for clients in {{CITY}}.",
    s2icon: spark,
    s2body: "Beauty and finish options based on your public listing focus.",
    s3icon: star,
    s3body: "Simple contact so clients can book without friction.",
    processTitle: "How a visit works",
    processSub: "A clear path from discovery to appointment.",
    p1t: "Discover",
    p1b: "Find the salon details and specialty online.",
    p2t: "Call",
    p2b: "Reach the front desk on the listed number.",
    p3t: "Visit",
    p3b: "Arrive with location and hours already clear.",
    galleryTitle: "Salon atmosphere",
    gallerySub: "Illustrative imagery for the proposal — swap with real salon photos later.",
    g1cap: "Styling",
    g2cap: "Chair",
    g3cap: "Finish",
    g4cap: "Tools",
    g5cap: "Lounge",
    ctaTitle: "Ready to book?",
    ctaBody: "Call the salon number from your listing and schedule directly.",
    images: {
      hero: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80",
      about: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=80",
      g1: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=80",
      g2: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80",
      g3: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80",
      g4: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1000&q=80",
      g5: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1000&q=80",
    },
    demo: {
      BUSINESS_NAME: "Glow Studio Salon",
      CATEGORY: "Hair salons",
      CITY: "Indore",
      SPECIALTY: "Hair & beauty",
      PHONE: "+91 98765 43210",
      EMAIL: "salon@example.com",
      ADDRESS: "12 MG Road",
      HOURS: "Tue–Sun · 10am–8pm",
      ABOUT_SHORT: "Modern cuts, colour, and finish with a calm chair-side experience.",
      ABOUT_LONG:
        "Glow Studio Salon helps clients look polished for everyday and events. This Techlyser concept uses listing details — add real photos and services when you go live.",
      SERVICE_1: "Haircut & style",
      SERVICE_2: "Colour & highlights",
      SERVICE_3: "Easy booking call",
    },
  },
  {
    file: "restaurant.html",
    label: "Restaurant / cafe",
    titleSuffix: "Restaurant",
    fontsLink:
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap",
    vars: {
      ink: "#1c1410",
      inkSoft: "#3a2418",
      muted: "#6d5c50",
      line: "#e8ddd3",
      bg: "#faf6f1",
      surface: "#ffffff",
      accent: "#b84a2e",
      accent2: "#8f3520",
      accentSoft: "#f3e4dc",
      warm: "#f3e4dc",
      shadow: "0 18px 50px rgba(28,20,16,0.10)",
      topbarBg: "rgba(250,246,241,0.88)",
      bodyFont: "'Source Sans 3', system-ui, sans-serif",
      displayFont: "'Libre Baskerville', Georgia, serif",
      bodyBg:
        "radial-gradient(1000px 500px at 85% -5%, rgba(184,74,46,0.12), transparent 55%), radial-gradient(700px 400px at -5% 25%, rgba(143,53,32,0.06), transparent 50%), #faf6f1",
      contactGradient: "linear-gradient(145deg, #1c1410, #3a2418 55%, #5a3420)",
    },
    brandIcon: fork,
    trust1: "Local hospitality",
    floatText: "Tables in {{CITY}}",
    heroAlt: "Restaurant dining table",
    aboutAlt: "Restaurant interior",
    aboutTitle: "About the kitchen",
    aboutSub: "A clear website concept for guests who want food, place, and phone fast.",
    aboutHeadline: "Hospitality that feels welcoming",
    aboutCta: "Call to reserve",
    h1t: "Menu focus",
    h1b: "{{SPECIALTY}}",
    h2t: "Easy find",
    h2b: "{{ADDRESS}}",
    h3t: "Call ahead",
    h3b: "Direct listing phone",
    servicesTitle: "Guest highlights",
    servicesSub: "What diners should notice before they visit.",
    s1icon: fork,
    s1body: "Signature dishes and cuisine notes from your listing.",
    s2icon: pinIcon,
    s2body: "Location clarity so guests arrive without guessing.",
    s3icon: phoneIcon,
    s3body: "One-tap calling for table questions and takeaway.",
    processTitle: "From browse to table",
    processSub: "Simple guest journey for a local restaurant site.",
    p1t: "Browse",
    p1b: "See the name, specialty, and vibe online.",
    p2t: "Call",
    p2b: "Confirm hours or reserve with the listed number.",
    p3t: "Dine",
    p3b: "Visit with address already in hand.",
    galleryTitle: "Dining atmosphere",
    gallerySub: "Illustrative food and dining imagery for the proposal.",
    g1cap: "Dining",
    g2cap: "Plates",
    g3cap: "Ambience",
    g4cap: "Kitchen",
    g5cap: "Service",
    ctaTitle: "Hungry already?",
    ctaBody: "Call the restaurant number and ask about tables or takeaway.",
    images: {
      hero: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
      about: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80",
      g1: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80",
      g2: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
      g3: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
      g4: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80",
      g5: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80",
    },
    demo: {
      BUSINESS_NAME: "Spice Route Kitchen",
      CATEGORY: "Restaurants",
      CITY: "Indore",
      SPECIALTY: "North Indian · Thali",
      PHONE: "+91 98765 11122",
      EMAIL: "kitchen@example.com",
      ADDRESS: "22 Palasia Square",
      HOURS: "Daily · 11am–11pm",
      ABOUT_SHORT: "Warm hospitality and flavourful plates for guests across Indore.",
      ABOUT_LONG:
        "Spice Route Kitchen is listed for local dining with clear contact and location details. This concept shows how a premium restaurant website can look.",
      SERVICE_1: "Dine-in favourites",
      SERVICE_2: "Easy location",
      SERVICE_3: "Call / takeaway",
    },
  },
  {
    file: "retail.html",
    label: "Retail / shop",
    titleSuffix: "Store",
    fontsLink:
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap",
    vars: {
      ink: "#14171c",
      inkSoft: "#243041",
      muted: "#5b6470",
      line: "#e2e6ec",
      bg: "#f3f5f8",
      surface: "#ffffff",
      accent: "#e4572e",
      accent2: "#c2410c",
      accentSoft: "#ffe3d8",
      warm: "#fff1ea",
      shadow: "0 18px 50px rgba(20,23,28,0.10)",
      topbarBg: "rgba(243,245,248,0.88)",
      bodyFont: "'IBM Plex Sans', system-ui, sans-serif",
      displayFont: "'Space Grotesk', system-ui, sans-serif",
      bodyBg:
        "radial-gradient(1000px 500px at 90% -10%, rgba(228,87,46,0.12), transparent 55%), radial-gradient(700px 400px at -8% 20%, rgba(194,65,12,0.06), transparent 50%), #f3f5f8",
      contactGradient: "linear-gradient(145deg, #14171c, #243041 60%, #e4572e)",
    },
    brandIcon: bag,
    trust1: "Local storefront",
    floatText: "Shopping in {{CITY}}",
    heroAlt: "Retail store interior",
    aboutAlt: "Product shelves",
    aboutTitle: "About the store",
    aboutSub: "A crisp storefront page for browsers who become walk-in buyers.",
    aboutHeadline: "Products with a clear path to visit",
    aboutCta: "Call the store",
    h1t: "Category",
    h1b: "{{CATEGORY}}",
    h2t: "Focus",
    h2b: "{{SPECIALTY}}",
    h3t: "Visit",
    h3b: "{{CITY}} storefront",
    servicesTitle: "Why customers stop by",
    servicesSub: "Simple retail promises that match listing data.",
    s1icon: bag,
    s1body: "Category assortment presented clearly for {{CITY}} shoppers.",
    s2icon: check,
    s2body: "Store details and hours without incomplete listing clutter.",
    s3icon: phoneIcon,
    s3body: "Call ahead for stock questions using the listed phone.",
    processTitle: "Shop journey",
    processSub: "From discovery to store visit in three steps.",
    p1t: "Browse",
    p1b: "See what the store is known for online.",
    p2t: "Call",
    p2b: "Confirm availability on the listing number.",
    p3t: "Visit",
    p3b: "Arrive with address and hours ready.",
    galleryTitle: "Store visuals",
    gallerySub: "Illustrative retail imagery for the proposal concept.",
    g1cap: "Floor",
    g2cap: "Products",
    g3cap: "Display",
    g4cap: "Checkout",
    g5cap: "Bags",
    ctaTitle: "Need something today?",
    ctaBody: "Call the store number and ask before you travel.",
    images: {
      hero: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
      about: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1400&q=80",
      g1: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
      g2: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1000&q=80",
      g3: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1000&q=80",
      g4: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=80",
      g5: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1000&q=80",
    },
    demo: {
      BUSINESS_NAME: "Urban Mart Store",
      CATEGORY: "Clothing stores",
      CITY: "Indore",
      SPECIALTY: "Everyday apparel",
      PHONE: "+91 98765 22233",
      EMAIL: "store@example.com",
      ADDRESS: "5 Treasure Island Mall",
      HOURS: "Mon–Sun · 11am–9pm",
      ABOUT_SHORT: "A clear local storefront for apparel shoppers who want to visit with confidence.",
      ABOUT_LONG:
        "Urban Mart Store presents category, contact, and location from public listing data so customers know exactly where to go.",
      SERVICE_1: "In-store selection",
      SERVICE_2: "Listed specialty",
      SERVICE_3: "Call before visit",
    },
  },
  {
    file: "fitness.html",
    label: "Fitness / gym",
    titleSuffix: "Fitness",
    fontsLink:
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&display=swap",
    vars: {
      ink: "#f5f7fa",
      inkSoft: "#d7dde8",
      muted: "#9aa3b2",
      line: "#242a35",
      bg: "#0f1115",
      surface: "#171a21",
      accent: "#39ff14",
      accent2: "#22c55e",
      accentSoft: "#1d2a1a",
      warm: "#1d2a1a",
      shadow: "0 18px 50px rgba(0,0,0,0.4)",
      topbarBg: "rgba(15,17,21,0.9)",
      bodyFont: "Barlow, system-ui, sans-serif",
      displayFont: "'Bebas Neue', Impact, sans-serif",
      bodyBg:
        "radial-gradient(900px 500px at 90% 0%, rgba(57,255,20,0.12), transparent 55%), radial-gradient(700px 400px at 0% 40%, rgba(34,197,94,0.08), transparent 50%), #0f1115",
      contactGradient: "linear-gradient(145deg, #0a0b0e, #151922 55%, #1d2430)",
      btnText: "#0f1115",
    },
    brandIcon: dumbbell,
    trust1: "Train with focus",
    floatText: "Sessions in {{CITY}}",
    heroAlt: "Gym training floor",
    aboutAlt: "Workout space",
    aboutTitle: "About the gym",
    aboutSub: "A high-energy landing page for members and walk-in trials.",
    aboutHeadline: "Training that starts with a call",
    aboutCta: "Call to join",
    h1t: "Training",
    h1b: "{{SPECIALTY}}",
    h2t: "Hours",
    h2b: "{{HOURS}}",
    h3t: "City",
    h3b: "{{CITY}}",
    servicesTitle: "Training focus",
    servicesSub: "What members should understand at a glance.",
    s1icon: dumbbell,
    s1body: "Strength and conditioning aligned to your listing specialty.",
    s2icon: leaf,
    s2body: "Space and programs presented clearly for local athletes.",
    s3icon: phoneIcon,
    s3body: "Membership questions answered on the listed phone line.",
    processTitle: "Start training",
    processSub: "From discovery to first session.",
    p1t: "Explore",
    p1b: "Review the gym name, specialty, and hours.",
    p2t: "Call",
    p2b: "Ask about membership on the listed number.",
    p3t: "Train",
    p3b: "Visit with location already confirmed.",
    galleryTitle: "Training floor",
    gallerySub: "Illustrative fitness imagery for the proposal.",
    g1cap: "Floor",
    g2cap: "Weights",
    g3cap: "Cardio",
    g4cap: "Coach",
    g5cap: "Stretch",
    ctaTitle: "Ready to train?",
    ctaBody: "Call the gym number and ask about joining options.",
    images: {
      hero: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80",
      about: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1400&q=80",
      g1: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80",
      g2: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1000&q=80",
      g3: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=80",
      g4: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1000&q=80",
      g5: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1000&q=80",
    },
    demo: {
      BUSINESS_NAME: "Iron Path Gym",
      CATEGORY: "Gyms",
      CITY: "Indore",
      SPECIALTY: "Strength training",
      PHONE: "+91 98765 33344",
      EMAIL: "gym@example.com",
      ADDRESS: "18 Vijay Nagar",
      HOURS: "Mon–Sat · 6am–10pm",
      ABOUT_SHORT: "Focused strength training with clear membership contact for Indore athletes.",
      ABOUT_LONG:
        "Iron Path Gym presents listing hours, specialty, and phone so new members can enquire without friction.",
      SERVICE_1: "Strength floor",
      SERVICE_2: "Guided sessions",
      SERVICE_3: "Membership call",
    },
  },
  {
    file: "professional.html",
    label: "Professional services",
    titleSuffix: "Professional",
    fontsLink:
      "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,700&family=Figtree:wght@400;500;600;700&display=swap",
    vars: {
      ink: "#101828",
      inkSoft: "#1d2939",
      muted: "#667085",
      line: "#e4e7ec",
      bg: "#f6f7f9",
      surface: "#ffffff",
      accent: "#175cd3",
      accent2: "#1549a8",
      accentSoft: "#d1e0ff",
      warm: "#eef4ff",
      shadow: "0 18px 50px rgba(16,24,40,0.08)",
      topbarBg: "rgba(246,247,249,0.9)",
      bodyFont: "Figtree, system-ui, sans-serif",
      displayFont: "Newsreader, Georgia, serif",
      bodyBg:
        "radial-gradient(1000px 500px at 88% -8%, rgba(23,92,211,0.12), transparent 55%), radial-gradient(700px 400px at -5% 30%, rgba(21,73,168,0.06), transparent 50%), #f6f7f9",
      contactGradient: "linear-gradient(145deg, #0b1f3a, #163a66 60%, #175cd3)",
    },
    brandIcon: briefcase,
    trust1: "Clear professional presence",
    floatText: "Consultations in {{CITY}}",
    heroAlt: "Professional office workspace",
    aboutAlt: "Meeting discussion",
    aboutTitle: "About the practice",
    aboutSub: "A trustworthy landing page for clients seeking professional help.",
    aboutHeadline: "Advice with a clear next step",
    aboutCta: "Call the office",
    h1t: "Practice",
    h1b: "{{CATEGORY}}",
    h2t: "Focus",
    h2b: "{{SPECIALTY}}",
    h3t: "City",
    h3b: "{{CITY}}",
    servicesTitle: "How we help",
    servicesSub: "Service blocks clients understand before calling.",
    s1icon: briefcase,
    s1body: "Professional services aligned to your listed specialty.",
    s2icon: check,
    s2body: "Office details and credentials when present on the listing.",
    s3icon: phoneIcon,
    s3body: "Direct phone access for enquiries and appointments.",
    processTitle: "Client path",
    processSub: "From discovery to consultation.",
    p1t: "Review",
    p1b: "Read the practice name, focus, and city.",
    p2t: "Enquire",
    p2b: "Call the listed office number.",
    p3t: "Meet",
    p3b: "Visit with address and hours confirmed.",
    galleryTitle: "Office atmosphere",
    gallerySub: "Illustrative workspace imagery for the proposal.",
    g1cap: "Office",
    g2cap: "Desk",
    g3cap: "Meeting",
    g4cap: "Lobby",
    g5cap: "Docs",
    ctaTitle: "Need advice?",
    ctaBody: "Call the office number from the listing to enquire.",
    images: {
      hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
      about: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80",
      g1: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80",
      g2: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=80",
      g3: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80",
      g4: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=80",
      g5: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80",
    },
    demo: {
      BUSINESS_NAME: "Northbridge Advisors",
      CATEGORY: "Consultants",
      CITY: "Indore",
      SPECIALTY: "Business consulting",
      PHONE: "+91 98765 44455",
      EMAIL: "office@example.com",
      ADDRESS: "401 Sapphire Heights",
      HOURS: "Mon–Fri · 10am–6pm",
      ABOUT_SHORT: "Practical consulting with clear contact for businesses in Indore.",
      ABOUT_LONG:
        "Northbridge Advisors uses verified listing fields so clients can find specialty, phone, and office location quickly.",
      SERVICE_1: "Advisory sessions",
      SERVICE_2: "Listed specialty",
      SERVICE_3: "Office call",
    },
  },
  {
    file: "home-services.html",
    label: "Home services",
    titleSuffix: "Home Services",
    fontsLink:
      "https://fonts.googleapis.com/css2?family=Sora:wght@500;700&family=Nunito+Sans:wght@400;500;600;700&display=swap",
    vars: {
      ink: "#1a2118",
      inkSoft: "#2f4030",
      muted: "#5f6b5a",
      line: "#dce5d8",
      bg: "#f5f7f4",
      surface: "#ffffff",
      accent: "#2f6b3a",
      accent2: "#245530",
      accentSoft: "#dcead9",
      warm: "#e8f0e6",
      shadow: "0 18px 50px rgba(26,33,24,0.09)",
      topbarBg: "rgba(245,247,244,0.9)",
      bodyFont: "'Nunito Sans', system-ui, sans-serif",
      displayFont: "Sora, system-ui, sans-serif",
      bodyBg:
        "radial-gradient(1000px 500px at 90% -8%, rgba(47,107,58,0.12), transparent 55%), radial-gradient(700px 400px at -8% 25%, rgba(36,85,48,0.06), transparent 50%), #f5f7f4",
      contactGradient: "linear-gradient(145deg, #1a2118, #2f4030 55%, #2f6b3a)",
    },
    brandIcon: wrench,
    trust1: "Local home help",
    floatText: "Service in {{CITY}}",
    heroAlt: "Home service technician at work",
    aboutAlt: "Home maintenance tools",
    aboutTitle: "About the service",
    aboutSub: "A practical landing page for homeowners who need reliable local help.",
    aboutHeadline: "Home jobs with a clear call path",
    aboutCta: "Call for service",
    h1t: "Service",
    h1b: "{{CATEGORY}}",
    h2t: "Focus",
    h2b: "{{SPECIALTY}}",
    h3t: "Area",
    h3b: "{{CITY}}",
    servicesTitle: "What we handle",
    servicesSub: "Service cards that match listing information.",
    s1icon: wrench,
    s1body: "Core home service work aligned to {{SPECIALTY}}.",
    s2icon: home,
    s2body: "Local coverage details for homes and businesses in {{CITY}}.",
    s3icon: phoneIcon,
    s3body: "Fast calling so customers can request a visit quickly.",
    processTitle: "How service works",
    processSub: "From enquiry to on-site visit.",
    p1t: "Request",
    p1b: "Find the service name and specialty online.",
    p2t: "Call",
    p2b: "Explain the job on the listed phone number.",
    p3t: "Visit",
    p3b: "Technician arrives with location already clear.",
    galleryTitle: "On-the-job visuals",
    gallerySub: "Illustrative home-service imagery for the proposal.",
    g1cap: "Work",
    g2cap: "Tools",
    g3cap: "Repair",
    g4cap: "Home",
    g5cap: "Finish",
    ctaTitle: "Need help at home?",
    ctaBody: "Call the listed number and describe the job.",
    images: {
      hero: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80",
      about: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80",
      g1: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1400&q=80",
      g2: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80",
      g3: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1000&q=80",
      g4: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=80",
      g5: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80",
    },
    demo: {
      BUSINESS_NAME: "FixRight Home Services",
      CATEGORY: "Plumbers",
      CITY: "Indore",
      SPECIALTY: "Plumbing & repairs",
      PHONE: "+91 98765 55566",
      EMAIL: "service@example.com",
      ADDRESS: "Rau Industrial Area",
      HOURS: "Mon–Sat · 9am–7pm",
      ABOUT_SHORT: "Reliable local plumbing help with clear phone access for Indore homes.",
      ABOUT_LONG:
        "FixRight Home Services shows specialty, hours, and contact from public listing data so homeowners can call quickly.",
      SERVICE_1: "Repair visits",
      SERVICE_2: "Local coverage",
      SERVICE_3: "Call for booking",
    },
  },
];

for (const t of templates) {
  const html = buildTemplate(t);
  const filePath = path.join(outDir, t.file);
  writeFileSync(filePath, html, "utf8");
  console.log("wrote", t.file, `(${html.length} chars)`);
}

console.log("done", templates.length, "templates →", outDir);
console.log("placeholders:", PLACEHOLDERS.join(", "));
