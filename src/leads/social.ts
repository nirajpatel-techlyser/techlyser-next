export type SocialPlatformName = "INSTAGRAM" | "FACEBOOK" | "LINKEDIN" | "YOUTUBE" | "OTHER";

export type ExtractedProfile = {
  platform: SocialPlatformName;
  url: string;
  verification: "VERIFIED" | "UNVERIFIED";
  evidence: string;
};

const RULES: Array<{ platform: SocialPlatformName; host: RegExp; path: RegExp }> = [
  { platform: "INSTAGRAM", host: /(^|\.)instagram\.com$/i, path: /^\/[A-Za-z0-9._]+\/?$/ },
  { platform: "FACEBOOK", host: /(^|\.)facebook\.com$/i, path: /^\/[A-Za-z0-9.\-]+\/?$/ },
  { platform: "LINKEDIN", host: /(^|\.)linkedin\.com$/i, path: /^\/company\/[A-Za-z0-9\-_%]+\/?$/ },
  { platform: "YOUTUBE", host: /(^|\.)youtube\.com$/i, path: /^\/(@[A-Za-z0-9._\-]+|channel\/[A-Za-z0-9_\-]+)\/?$/ },
];

function decodeHref(raw: string) {
  return raw.replace(/&amp;/g, "&").trim();
}

export function extractSocialProfiles(html: string): ExtractedProfile[] {
  const found = new Map<SocialPlatformName, ExtractedProfile>();
  const hrefs = html.match(/href\s*=\s*["']([^"']+)["']/gi) || [];
  for (const chunk of hrefs) {
    const match = chunk.match(/href\s*=\s*["']([^"']+)["']/i);
    if (!match?.[1]) continue;
    let url: URL;
    try {
      url = new URL(decodeHref(match[1]));
    } catch {
      continue;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") continue;
    const host = url.hostname.replace(/^www\./, "");
    for (const rule of RULES) {
      if (!rule.host.test(host) || !rule.path.test(url.pathname)) continue;
      if (found.has(rule.platform)) break;
      const clean = `${url.origin}${url.pathname}`.replace(/\/$/, "");
      found.set(rule.platform, {
        platform: rule.platform,
        url: clean,
        verification: "VERIFIED",
        evidence: "Link published on the business website",
      });
      break;
    }
  }
  return [...found.values()];
}

export function extractPublicEmail(html: string): string | null {
  const mailto = html.match(/mailto:([A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,})/i);
  const candidate = mailto?.[1] || html.match(/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i)?.[0];
  if (!candidate) return null;
  const email = candidate.toLowerCase();
  if (
    email.endsWith("@example.com") ||
    email.endsWith("@sentry.io") ||
    email.endsWith("@shopify.com") ||
    email.includes("wixpress") ||
    email.includes("myshopify")
  ) {
    return null;
  }
  return email;
}

export function pageTitle(html: string) {
  const match = html.match(/<title[^>]*>([^<]{1,160})<\/title>/i);
  return match?.[1]?.replace(/\s+/g, " ").trim() || "";
}
