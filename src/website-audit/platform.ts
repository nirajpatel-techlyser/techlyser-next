export type PageKind =
  | "home"
  | "collection"
  | "product"
  | "cart"
  | "about"
  | "contact"
  | "story"
  | "other";

export type PlatformInfo = {
  platform: "shopify" | "wordpress" | "webflow" | "squarespace" | "next" | "unknown";
  themeHint: string | null;
  confidence: "verified" | "potential";
};

export function detectPlatform(html: string): PlatformInfo {
  const lower = html.toLowerCase();
  if (
    /cdn\.shopify\.com/i.test(html) ||
    /shopify\.theme/i.test(html) ||
    /myshopify\.com/i.test(html) ||
    /Shopify\.shop/i.test(html)
  ) {
    let themeHint: string | null = null;
    if (/motion/i.test(html) && (/theme/i.test(html) || /shopify/i.test(html))) {
      themeHint = "Motion (theme signals observed)";
    } else {
      const themeMatch = html.match(/Shopify\.theme\s*=\s*\{[^}]*"name"\s*:\s*"([^"]+)"/i);
      if (themeMatch?.[1]) themeHint = themeMatch[1];
    }
    return { platform: "shopify", themeHint, confidence: "verified" };
  }
  if (/wp-content|wordpress/i.test(lower)) {
    return { platform: "wordpress", themeHint: null, confidence: "verified" };
  }
  if (/webflow/i.test(lower)) {
    return { platform: "webflow", themeHint: null, confidence: "verified" };
  }
  if (/squarespace/i.test(lower)) {
    return { platform: "squarespace", themeHint: null, confidence: "verified" };
  }
  if (/__NEXT_DATA__|\/_next\//i.test(html)) {
    return { platform: "next", themeHint: null, confidence: "potential" };
  }
  return { platform: "unknown", themeHint: null, confidence: "potential" };
}

export function classifyPageKind(url: string, title?: string | null): PageKind {
  let path = "/";
  try {
    path = new URL(url).pathname.toLowerCase();
  } catch {
    path = url.toLowerCase();
  }
  const blob = `${path} ${title || ""}`.toLowerCase();
  if (path === "/" || path === "") return "home";
  if (/\/cart|\/checkout/.test(path)) return "cart";
  if (/\/collections?\//.test(path) || /collection/.test(blob)) return "collection";
  if (/\/products?\//.test(path) || /\/product\//.test(path)) return "product";
  if (/about|our-story|who-we-are/.test(blob)) return "about";
  if (/contact/.test(blob)) return "contact";
  if (/story|mission|brand/.test(blob)) return "story";
  return "other";
}

export function pageKindLabel(kind: PageKind) {
  switch (kind) {
    case "home":
      return "Homepage";
    case "collection":
      return "Collection page";
    case "product":
      return "Product page";
    case "cart":
      return "Cart page";
    case "about":
      return "About page";
    case "contact":
      return "Contact page";
    case "story":
      return "Story page";
    default:
      return "Internal page";
  }
}

/** Prefer Shopify commerce paths, otherwise marketing pages. */
export function preferredInternalPaths(origin: string, isShopify: boolean) {
  if (isShopify) {
    return [
      `${origin}/collections/all`,
      `${origin}/cart`,
      `${origin}/pages/about-us`,
      `${origin}/pages/about`,
      `${origin}/pages/contact`,
    ];
  }
  return [
    `${origin}/about`,
    `${origin}/about-us`,
    `${origin}/contact`,
    `${origin}/contact-us`,
    `${origin}/our-story`,
    `${origin}/story`,
    `${origin}/services`,
  ];
}
