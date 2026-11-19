import { assertPublicHttpUrl } from "@/leads/ssrf";
import type { DiscoveredImage } from "@/lib/business-discovery/images/types";

function absolutize(base: URL, raw: string) {
  try {
    return new URL(raw, base).toString();
  } catch {
    return null;
  }
}

/** Conservative harvest of og:image / twitter:image from the official website only. */
export async function harvestOfficialSiteImages(input: {
  websiteUrl: string | null | undefined;
  businessName: string;
}): Promise<DiscoveredImage[]> {
  if (!input.websiteUrl) return [];
  try {
    const pageUrl = await assertPublicHttpUrl(input.websiteUrl);
    const response = await fetch(pageUrl.toString(), {
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "TechlyserBusinessOpportunityFinder/1.0 (admin@techlyser.com)",
      },
    });
    if (!response.ok) return [];
    const html = (await response.text()).slice(0, 250_000);
    const candidates: string[] = [];
    const patterns = [
      /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
      /name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
      /rel=["']icon["'][^>]*href=["']([^"']+)["']/i,
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) candidates.push(match[1]);
    }

    const out: DiscoveredImage[] = [];
    const seen = new Set<string>();
    for (const raw of candidates) {
      const absolute = absolutize(pageUrl, raw);
      if (!absolute || seen.has(absolute)) continue;
      seen.add(absolute);
      const isLogo = /icon|logo/i.test(raw);
      out.push({
        sourceUrl: absolute,
        assetType: isLogo ? "LOGO" : "PHOTO",
        imageCategory: isLogo ? "logo" : "gallery",
        usagePermission: "unknown",
        attribution: `From official site ${pageUrl.hostname} — verify reuse rights before commercial outreach`,
        altText: `${input.businessName} ${isLogo ? "logo" : "website image"}`,
        provider: "official_website",
        isIllustrative: false,
      });
      if (out.length >= 3) break;
    }
    return out;
  } catch {
    return [];
  }
}
