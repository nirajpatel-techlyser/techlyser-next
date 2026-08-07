import {
  enhanceHtmlWithHeadingIds,
  estimateWordCount,
} from "@/lib/blog-html";

function looksLikeHtml(content: string) {
  const trimmed = content.trim();
  return /^<[a-z][\s\S]*>/i.test(trimmed);
}

function fileKey(url: string) {
  try {
    const clean = url.split("?")[0].split("#")[0];
    const parts = clean.split("/");
    return (parts[parts.length - 1] || "").toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function stripDuplicateCoverImage(html: string, coverImage?: string | null) {
  if (!coverImage) {
    return html;
  }

  const coverKey = fileKey(coverImage);
  if (!coverKey) {
    return html;
  }

  return html.replace(
    /(?:<p>\s*)?(?:<a[^>]*>\s*)?<img\b[^>]*src=["']([^"']+)["'][^>]*>\s*(?:<\/a>\s*)?(?:<\/p>\s*)?/i,
    (match, src: string) => {
      return fileKey(src) === coverKey ? "" : match;
    },
  );
}

function stripConsecutiveDuplicateImages(html: string) {
  let previousKey = "";

  return html.replace(
    /(?:<p>\s*)?(?:<a[^>]*>\s*)?<img\b[^>]*src=["']([^"']+)["'][^>]*>\s*(?:<\/a>\s*)?(?:<\/p>\s*)?/gi,
    (match, src: string) => {
      const key = fileKey(src);
      if (key && key === previousKey) {
        return "";
      }
      previousKey = key;
      return match;
    },
  );
}

/** Lightweight sanitizer — avoids jsdom/DOMPurify crashes on Vercel serverless. */
function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '$1="#"')
    .replace(/<\/?\s*(?:iframe|object|embed|link|meta)[^>]*>/gi, (tag) => {
      if (/^<iframe\b/i.test(tag) && /youtube\.com|youtu\.be|vimeo\.com/i.test(tag)) {
        return tag;
      }
      if (/^<\/iframe/i.test(tag)) {
        return tag;
      }
      return "";
    });
}

/** Ensure images have alt text for a11y + image SEO. */
function ensureImageAlts(html: string, fallbackAlt: string) {
  return html.replace(/<img\b([^>]*)>/gi, (match, attrs: string) => {
    if (/\balt\s*=/.test(attrs)) {
      return match.replace(/\balt\s*=\s*(['"])\s*\1/, `alt="${fallbackAlt}"`);
    }
    return `<img alt="${fallbackAlt}"${attrs}>`;
  });
}

export async function prepareBlogHtml(
  content: string,
  coverImage?: string | null,
  title = "Blog image",
) {
  let html = content || "";

  try {
    if (!looksLikeHtml(html)) {
      const { marked } = await import("marked");
      html = await marked.parse(html, { gfm: true, breaks: true });
    }
  } catch (error) {
    console.error("[prepareBlogHtml] markdown parse failed:", error);
  }

  const withoutDuplicateCover = stripDuplicateCoverImage(html, coverImage);
  const dedupedHtml = stripConsecutiveDuplicateImages(withoutDuplicateCover);
  const safeHtml = sanitizeHtml(dedupedHtml);
  const withAlts = ensureImageAlts(safeHtml, title);
  const { html: withIds, toc } = enhanceHtmlWithHeadingIds(withAlts);

  return {
    html: withIds,
    toc,
    wordCount: estimateWordCount(withIds),
  };
}
