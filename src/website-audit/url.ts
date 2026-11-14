import { assertPublicHttpUrl } from "@/leads/ssrf";

export async function normalizeAuditUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Enter a website URL.");
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = await assertPublicHttpUrl(withProtocol);
  url.hash = "";
  // Keep path; strip tracking noise lightly
  url.searchParams.forEach((_, key) => {
    if (/^utm_/i.test(key) || key === "fbclid" || key === "gclid") {
      url.searchParams.delete(key);
    }
  });
  return {
    input: trimmed,
    normalizedUrl: url.toString(),
    origin: url.origin,
    hostname: url.hostname,
  };
}
