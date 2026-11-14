import { fetchAuditPage, fetchOptionalText } from "@/website-audit/fetch";
import { discoverCandidatePaths, getTitle } from "@/website-audit/html";
import {
  classifyPageKind,
  detectPlatform,
  preferredInternalPaths,
  type PageKind,
} from "@/website-audit/platform";
import type { AnalyzedPage, PlatformSummary } from "@/website-audit/types";

export type CrawledSite = {
  homepageUrl: string;
  pages: Array<AnalyzedPage & { html?: string }>;
  robotsTxt: string | null;
  sitemapFound: boolean;
  limitations: string[];
  platform: PlatformSummary;
};

function uniqueUrls(urls: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of urls) {
    try {
      const clean = new URL(url);
      clean.hash = "";
      const key = clean.toString().replace(/\/$/, "");
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(clean.toString());
    } catch {
      // skip
    }
  }
  return out;
}

export async function crawlSite(normalizedUrl: string): Promise<CrawledSite> {
  const limitations: string[] = [];
  const pages: CrawledSite["pages"] = [];
  let platform: PlatformSummary = {
    platform: "unknown",
    themeHint: null,
    confidence: "potential",
  };

  let homepageHtml = "";
  let homepageFinal = normalizedUrl;
  try {
    const home = await fetchAuditPage(normalizedUrl);
    homepageHtml = home.html;
    homepageFinal = home.finalUrl;
    platform = detectPlatform(home.html);
    pages.push({
      url: home.finalUrl,
      title: getTitle(home.html),
      status: "ok",
      htmlLength: home.html.length,
      html: home.html,
      kind: "home",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Homepage unavailable";
    limitations.push(`Homepage could not be fetched: ${message}`);
    pages.push({ url: normalizedUrl, title: null, status: "failed", error: message, kind: "home" });
    return {
      homepageUrl: normalizedUrl,
      pages,
      robotsTxt: null,
      sitemapFound: false,
      limitations,
      platform,
    };
  }

  const origin = new URL(homepageFinal).origin;
  const robotsTxt = await fetchOptionalText(`${origin}/robots.txt`);
  const sitemapCandidates = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];
  let sitemapFound = false;
  for (const candidate of sitemapCandidates) {
    const body = await fetchOptionalText(candidate);
    if (body && /<urlset|<sitemapindex/i.test(body)) {
      sitemapFound = true;
      break;
    }
  }

  const isShopify = platform.platform === "shopify";
  const preferred = preferredInternalPaths(origin, isShopify);
  const discovered = discoverCandidatePaths(homepageHtml, origin);
  const candidates = uniqueUrls([...preferred, ...discovered])
    .filter((url) => {
      try {
        return new URL(url).pathname.replace(/\/$/, "") !== "";
      } catch {
        return false;
      }
    })
    .slice(0, 5);

  const kindPriority: PageKind[] = [
    "collection",
    "product",
    "cart",
    "about",
    "contact",
    "story",
    "other",
  ];
  const byKind = new Map<PageKind, string>();
  for (const url of candidates) {
    const kind = classifyPageKind(url);
    if (kind === "home") continue;
    if (!byKind.has(kind)) byKind.set(kind, url);
  }
  const ordered = kindPriority
    .map((kind) => byKind.get(kind))
    .filter((url): url is string => Boolean(url))
    .slice(0, 4);

  for (const url of ordered) {
    try {
      const page = await fetchAuditPage(url);
      const title = getTitle(page.html);
      pages.push({
        url: page.finalUrl,
        title,
        status: "ok",
        htmlLength: page.html.length,
        html: page.html,
        kind: classifyPageKind(page.finalUrl, title),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Page unavailable";
      limitations.push(`Could not analyze ${url}: ${message}`);
      pages.push({
        url,
        title: null,
        status: "failed",
        error: message,
        kind: classifyPageKind(url),
      });
    }
  }

  if (!robotsTxt) limitations.push("robots.txt was not found or not accessible.");
  if (!sitemapFound) limitations.push("XML sitemap was not detected at common paths.");

  return {
    homepageUrl: homepageFinal,
    pages,
    robotsTxt,
    sitemapFound,
    limitations,
    platform,
  };
}
