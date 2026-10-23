import { assertPublicHttpUrl } from "@/leads/ssrf";

const MAX_BYTES = 1_000_000;
const TIMEOUT_MS = 8_000;

async function readLimited(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    total += value.byteLength;
    chunks.push(value);
  }
  await reader.cancel().catch(() => undefined);
  return new TextDecoder().decode(Buffer.concat(chunks).subarray(0, MAX_BYTES));
}

export async function fetchPublicHtml(startUrl: string) {
  let current = startUrl;
  for (let hop = 0; hop < 3; hop += 1) {
    const url = await assertPublicHttpUrl(current);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "TechlyserLeadResearch/1.0 (+https://techlyser.com)",
          Accept: "text/html",
        },
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) throw new Error("Redirect had no destination.");
        current = new URL(location, url).toString();
        continue;
      }
      if (!response.ok) throw new Error(`Website returned ${response.status}.`);
      const html = await readLimited(response);
      return { finalUrl: url.toString(), html };
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("Too many redirects.");
}
