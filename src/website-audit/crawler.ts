import { fetchAuditPage, fetchOptionalText } from "@/website-audit/fetch";
import { discoverCandidatePaths, getTitle } from "@/website-audit/html";
import type { AnalyzedPage } from "@/website-audit/types";

export type CrawledSite = {
  homepageUrl: string;
  pages: Array<AnalyzedPage & { html?: string }>;
  robotsTxt: string | null;
  sitemapFound: boolean;
  limitations: string[];
};

export async function crawlSite(normalizedUrl: string): Promise<CrawledSite> {
  const limitations: string[] = [];
  const pages: CrawledSite["pages"] = [];

  let homepageHtml = "";
  let homepageFinal = normalizedUrl;
  try {
    const home = await fetchAuditPage(normalizedUrl);
    homepageHtml = home.html;
    homepageFinal = home.finalUrl;
    pages.push({
      url: home.finalUrl,
      title: getTitle(home.html),
      status: "ok",
      htmlLength: home.html.length,
      html: home.html,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Homepage unavailable";
    limitations.push(`Homepage could not be fetched: ${message}`);
    pages.push({ url: normalizedUrl, title: null, status: "failed", error: message });
    return {
      homepageUrl: normalizedUrl,
      pages,
      robotsTxt: null,
      sitemapFound: false,
      limitations,
    };
  }

  const origin = new URL(homepageFinal).origin;
  const robotsTxt = await fetchOptionalText(`${origin}/robots.txt`);
  const sitemapCandidates = [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
  ];
  let sitemapFound = false;
  for (const candidate of sitemapCandidates) {
    const body = await fetchOptionalText(candidate);
    if (body && /<urlset|<sitemapindex/i.test(body)) {
      sitemapFound = true;
      break;
    }
  }

  const candidates = discoverCandidatePaths(homepageHtml, origin).slice(0, 3);
  for (const url of candidates) {
    try {
      const page = await fetchAuditPage(url);
      pages.push({
        url: page.finalUrl,
        title: getTitle(page.html),
        status: "ok",
        htmlLength: page.html.length,
        html: page.html,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Page unavailable";
      limitations.push(`Could not analyze ${url}: ${message}`);
      pages.push({ url, title: null, status: "failed", error: message });
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
  };
}
