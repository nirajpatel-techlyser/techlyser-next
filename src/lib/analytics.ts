import { createHash } from "crypto";

export function getClientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null;
  }

  return (
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    headers.get("true-client-ip") ||
    null
  );
}

export function hashIp(ip: string | null) {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export function getGeoFromHeaders(headers: Headers) {
  return {
    country:
      headers.get("x-vercel-ip-country") ||
      headers.get("cf-ipcountry") ||
      headers.get("x-country-code") ||
      null,
    city:
      headers.get("x-vercel-ip-city") ||
      headers.get("x-city") ||
      null,
    region:
      headers.get("x-vercel-ip-country-region") ||
      headers.get("x-region") ||
      null,
  };
}

export async function lookupGeoByIp(ip: string | null) {
  if (!ip || ip === "127.0.0.1" || ip === "::1") {
    return { country: "Local", city: "Localhost", region: null };
  }

  try {
    const response = await fetch(
      `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      },
    );

    if (!response.ok) {
      return { country: null, city: null, region: null };
    }

    const data = (await response.json()) as {
      country_name?: string;
      city?: string;
      region?: string;
      error?: boolean;
    };

    if (data.error) {
      return { country: null, city: null, region: null };
    }

    return {
      country: data.country_name || null,
      city: data.city || null,
      region: data.region || null,
    };
  } catch {
    return { country: null, city: null, region: null };
  }
}
