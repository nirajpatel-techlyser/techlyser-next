type BlogContentProps = {
  content: string;
  coverImage?: string | null;
};

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
      // Keep YouTube/Vimeo iframes only.
      if (/^<iframe\b/i.test(tag) && /youtube\.com|youtu\.be|vimeo\.com/i.test(tag)) {
        return tag;
      }
      if (/^<\/iframe/i.test(tag)) {
        return tag;
      }
      return "";
    });
}

export default async function BlogContent({
  content,
  coverImage,
}: BlogContentProps) {
  let html = content || "";

  try {
    if (!looksLikeHtml(html)) {
      const { marked } = await import("marked");
      html = await marked.parse(html, { gfm: true, breaks: true });
    }
  } catch (error) {
    console.error("[BlogContent] markdown parse failed:", error);
  }

  const withoutDuplicateCover = stripDuplicateCoverImage(html, coverImage);
  const dedupedHtml = stripConsecutiveDuplicateImages(withoutDuplicateCover);
  const safeHtml = sanitizeHtml(dedupedHtml);

  return (
    <div
      className="blog-content mt-8 text-slate-700"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
