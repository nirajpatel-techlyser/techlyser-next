import { fetchPublicHtml } from "@/leads/fetch-site";
import { assertPublicHttpUrl } from "@/leads/ssrf";

const AUDIT_UA = "TechlyserWebsiteAudit/1.0 (+https://techlyser.com/website-growth-audit)";

export async function fetchAuditPage(startUrl: string) {
  await assertPublicHttpUrl(startUrl);
  // Reuse SSRF-safe fetch; override UA via temporary wrap if needed.
  // fetchPublicHtml already uses lead research UA — acceptable for audit.
  return fetchPublicHtml(startUrl);
}

export async function fetchOptionalText(startUrl: string) {
  try {
    await assertPublicHttpUrl(startUrl);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(startUrl, {
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": AUDIT_UA, Accept: "text/plain,text/*,*/*" },
      });
      if (!response.ok) return null;
      const text = await response.text();
      return text.slice(0, 200_000);
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return null;
  }
}
