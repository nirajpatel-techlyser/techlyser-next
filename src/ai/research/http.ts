import { RESEARCH_USER_AGENT } from "./config";

export async function fetchText(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<string> {
  const { timeoutMs = 20_000, headers, signal, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: {
        "User-Agent": RESEARCH_USER_AGENT,
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, application/json, text/html;q=0.9, */*;q=0.8",
        ...headers,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const text = await fetchText(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
  });
  return JSON.parse(text) as T;
}

export function decodeXmlEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type ParsedFeedItem = {
  title: string;
  url: string;
  summary?: string;
  publishedAt?: string;
};

/** Minimal RSS/Atom parser — no extra dependency. */
export function parseFeedXml(xml: string, limit = 20): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = [];

  const entryBlocks =
    xml.match(/<item[\s\S]*?<\/item>/gi) ||
    xml.match(/<entry[\s\S]*?<\/entry>/gi) ||
    [];

  for (const block of entryBlocks.slice(0, limit)) {
    const title =
      matchTag(block, "title") ||
      matchTag(block, "media:title") ||
      "";
    const link =
      matchTag(block, "link") ||
      matchAttr(block, "link", "href") ||
      matchTag(block, "guid") ||
      matchTag(block, "id") ||
      "";
    const summary =
      matchTag(block, "description") ||
      matchTag(block, "summary") ||
      matchTag(block, "content") ||
      matchTag(block, "content:encoded") ||
      "";
    const publishedAt =
      matchTag(block, "pubDate") ||
      matchTag(block, "published") ||
      matchTag(block, "updated") ||
      matchTag(block, "dc:date") ||
      undefined;

    if (!title || !link) continue;

    items.push({
      title: decodeXmlEntities(title),
      url: decodeXmlEntities(link).trim(),
      summary: summary ? decodeXmlEntities(summary).slice(0, 500) : undefined,
      publishedAt,
    });
  }

  return items;
}

function matchTag(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  return m?.[1]?.trim() || null;
}

function matchAttr(block: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["'][^>]*/?>`, "i");
  const m = block.match(re);
  return m?.[1]?.trim() || null;
}
