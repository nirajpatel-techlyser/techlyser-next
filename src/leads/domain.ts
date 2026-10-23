const SKIP_HOSTS = new Set([
  "google.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "youtube.com",
  "youtu.be",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "pinterest.com",
]);

export function normalizeDomain(input: string): string | null {
  const raw = input.trim();
  if (!raw || raw.length > 300) return null;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (!host.includes(".") || host.length > 253) return null;
  if (SKIP_HOSTS.has(host) || [...SKIP_HOSTS].some((skip) => host.endsWith(`.${skip}`))) {
    return null;
  }
  return host;
}

export function websiteForDomain(domain: string) {
  return `https://${domain}`;
}
