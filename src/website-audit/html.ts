export function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getMetaContent(html: string, nameOrProperty: string) {
  const re = new RegExp(
    `<meta[^>]*(?:name|property)=["']${nameOrProperty}["'][^>]*content=["']([^"']*)["'][^>]*>|<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${nameOrProperty}["'][^>]*>`,
    "i",
  );
  const match = html.match(re);
  return (match?.[1] || match?.[2] || "").trim() || null;
}

export function getTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1] ? stripTags(match[1]).slice(0, 300) : null;
}

export function getCanonical(html: string) {
  const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  return match?.[1]?.trim() || null;
}

export function getHeadings(html: string) {
  const h1: string[] = [];
  const h2: string[] = [];
  const h3: string[] = [];
  for (const match of html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)) {
    h1.push(stripTags(match[1] || "").slice(0, 200));
  }
  for (const match of html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)) {
    h2.push(stripTags(match[1] || "").slice(0, 200));
  }
  for (const match of html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)) {
    h3.push(stripTags(match[1] || "").slice(0, 200));
  }
  return { h1, h2, h3 };
}

export function getImages(html: string) {
  const images: { src: string | null; alt: string | null }[] = [];
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = match[1] || "";
    const src = attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1] || null;
    const altMatch = attrs.match(/\balt=["']([^"']*)["']/i);
    const hasAlt = /\balt=/i.test(attrs);
    images.push({ src, alt: hasAlt ? altMatch?.[1] ?? "" : null });
  }
  return images;
}

export function getLinks(html: string, baseUrl: string) {
  const links: { href: string; text: string; internal: boolean }[] = [];
  let origin = "";
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    origin = "";
  }
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = match[1]?.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      continue;
    }
    let absolute = href;
    try {
      absolute = new URL(href, baseUrl).toString();
    } catch {
      continue;
    }
    links.push({
      href: absolute,
      text: stripTags(match[2] || "").slice(0, 120),
      internal: origin ? absolute.startsWith(origin) : false,
    });
  }
  return links;
}

export function hasViewport(html: string) {
  return /<meta[^>]+name=["']viewport["']/i.test(html);
}

export function hasHttps(url: string) {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

export function countForms(html: string) {
  return (html.match(/<form\b/gi) || []).length;
}

export function detectCtaSignals(html: string) {
  const text = stripTags(html).toLowerCase();
  const phrases = [
    "contact",
    "get a quote",
    "book",
    "schedule",
    "buy now",
    "shop now",
    "sign up",
    "get started",
    "request",
    "free consultation",
    "talk to",
    "hire",
  ];
  return phrases.filter((p) => text.includes(p));
}

export function detectTrustSignals(html: string) {
  const text = stripTags(html).toLowerCase();
  const signals = [
    "privacy policy",
    "terms",
    "testimonial",
    "review",
    "case study",
    "clients",
    "trusted by",
    "secure",
    "ssl",
  ];
  return signals.filter((s) => text.includes(s));
}

export function discoverCandidatePaths(html: string, origin: string) {
  const links = getLinks(html, origin);
  const wanted = [
    /about/i,
    /service/i,
    /product/i,
    /contact/i,
    /pricing/i,
    /work|portfolio|case/i,
  ];
  const picked: string[] = [];
  for (const link of links) {
    if (!link.internal) continue;
    try {
      const path = new URL(link.href).pathname;
      if (path === "/" || path.length < 2) continue;
      if (wanted.some((re) => re.test(path) || re.test(link.text))) {
        if (!picked.includes(link.href)) picked.push(link.href);
      }
    } catch {
      // ignore
    }
    if (picked.length >= 4) break;
  }
  return picked;
}
