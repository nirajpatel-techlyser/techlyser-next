import type { DiscoveredImage } from "@/lib/business-discovery/images/types";

export function unsplashConfigured() {
  return Boolean(process.env.UNSPLASH_ACCESS_KEY?.trim());
}

function queryForCategory(category: string, city: string) {
  const cat = category.toLowerCase();
  if (/restaurant|cafe|bakery|bar|food/.test(cat)) return `restaurant food ${city}`;
  if (/doctor|clinic|dental|hospital|health/.test(cat)) return `modern medical clinic interior`;
  if (/salon|barber|spa|beauty/.test(cat)) return `hair salon interior`;
  if (/gym|yoga|fitness/.test(cat)) return `fitness gym interior`;
  if (/grocery|retail|shop|store|clothing|electronics|toy/.test(cat)) return `retail store interior`;
  if (/lawyer|accountant|consultant|real estate|office/.test(cat)) return `professional office interior`;
  return `${category} business storefront`;
}

/** Authorized Unsplash search — illustrative stock only, never claimed as the business. */
export async function searchUnsplashStock(input: {
  category: string;
  city: string;
  businessName: string;
  limit?: number;
}): Promise<DiscoveredImage[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!key) return [];

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", queryForCategory(input.category, input.city));
  url.searchParams.set(
    "per_page",
    String(Math.min(6, Math.max(1, input.limit || 3))),
  );
  url.searchParams.set("orientation", "landscape");

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${key}`,
      "Accept-Version": "v1",
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return [];

  const data = (await response.json()) as {
    results?: Array<{
      urls?: { regular?: string; small?: string };
      user?: { name?: string; links?: { html?: string } };
      alt_description?: string | null;
      links?: { html?: string };
    }>;
  };

  return (data.results || [])
    .map((row): DiscoveredImage | null => {
      const sourceUrl = row.urls?.regular || row.urls?.small;
      if (!sourceUrl) return null;
      const photographer = row.user?.name || "Unsplash photographer";
      return {
        sourceUrl,
        assetType: "PHOTO",
        imageCategory: "stock",
        usagePermission: "stock_illustrative",
        attribution: `Photo by ${photographer} on Unsplash — illustrative stock, not a photo of ${input.businessName}`,
        altText: row.alt_description || `Illustrative ${input.category} imagery`,
        provider: "unsplash",
        isIllustrative: true,
      };
    })
    .filter((row): row is DiscoveredImage => Boolean(row));
}
