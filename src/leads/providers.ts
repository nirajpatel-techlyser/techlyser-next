import { marketLabel, type LeadMarketId } from "@/leads/markets";
import { normalizeDomain } from "@/leads/domain";

export type DiscoveryHit = {
  url: string;
  title: string;
  source: "manual" | "google_cse";
};

export type DiscoveryInput = {
  country: LeadMarketId;
  city?: string;
  niche: string;
  keywords: string;
  limit: number;
  domains: string[];
};

export function manualHits(domains: string[]): DiscoveryHit[] {
  const hits: DiscoveryHit[] = [];
  for (const domain of domains) {
    const normalized = normalizeDomain(domain);
    if (!normalized) continue;
    hits.push({
      url: `https://${normalized}`,
      title: normalized,
      source: "manual",
    });
  }
  return hits;
}

export function googleCseConfigured() {
  return Boolean(process.env.GOOGLE_CSE_API_KEY?.trim() && process.env.GOOGLE_CSE_CX?.trim());
}

export async function googleCseHits(input: DiscoveryInput): Promise<DiscoveryHit[]> {
  const key = process.env.GOOGLE_CSE_API_KEY?.trim();
  const cx = process.env.GOOGLE_CSE_CX?.trim();
  if (!key || !cx) {
    throw new Error("Google Custom Search is not configured. Add store URLs, or set GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX.");
  }
  const q = [input.keywords, input.niche, "shopify store", marketLabel(input.country), input.city || ""]
    .filter(Boolean)
    .join(" ")
    .slice(0, 200);
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", key);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", q);
  url.searchParams.set("num", String(Math.min(10, Math.max(1, input.limit))));
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) {
    throw new Error(`Google Custom Search returned ${response.status}. No leads were invented.`);
  }
  const data = (await response.json()) as { items?: { link?: string; title?: string }[] };
  const hits: DiscoveryHit[] = [];
  for (const item of data.items || []) {
    if (!item.link) continue;
    const domain = normalizeDomain(item.link);
    if (!domain) continue;
    hits.push({ url: `https://${domain}`, title: item.title || domain, source: "google_cse" });
  }
  return hits;
}
