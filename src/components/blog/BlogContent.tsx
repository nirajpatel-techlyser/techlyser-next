import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

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

  // Remove first matching <img> (and optional wrapping <p>/<a>) when it is the cover.
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

export default async function BlogContent({
  content,
  coverImage,
}: BlogContentProps) {
  const html = looksLikeHtml(content)
    ? content
    : await marked.parse(content, { gfm: true, breaks: true });

  const withoutDuplicateCover = stripDuplicateCoverImage(html, coverImage);
  const dedupedHtml = stripConsecutiveDuplicateImages(withoutDuplicateCover);

  const safeHtml = DOMPurify.sanitize(dedupedHtml, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
  });

  return (
    <div
      className="blog-content mt-8 text-slate-700"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
