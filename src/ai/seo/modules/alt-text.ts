import type { SeoAltTextResult, SeoModuleContext } from "../types";

function escapeAttr(value: string) {
  return value.replace(/"/g, "&quot;").replace(/</g, "");
}

export function optimizeAltText(ctx: SeoModuleContext): SeoAltTextResult {
  const issues: string[] = [];
  let imagesWithoutAlt = 0;
  let imagesFixed = 0;
  const fallback = escapeAttr(
    `${ctx.primaryKeyword || ctx.title} — Techlyser`,
  );

  const optimizedHtml = (ctx.content || "").replace(
    /<img\b([^>]*)>/gi,
    (match, attrs: string) => {
      const altMatch = attrs.match(/\balt\s*=\s*(["'])(.*?)\1/i);
      if (altMatch && altMatch[2].trim()) {
        return match;
      }
      imagesWithoutAlt += 1;
      imagesFixed += 1;
      if (/\balt\s*=/.test(attrs)) {
        return `<img${attrs.replace(/\balt\s*=\s*(['"]).*?\1/i, `alt="${fallback}"`)}>`;
      }
      return `<img alt="${fallback}"${attrs}>`;
    },
  );

  if (imagesFixed > 0) {
    issues.push(`Filled alt text on ${imagesFixed} image(s)`);
  }

  return {
    imagesWithoutAlt,
    imagesFixed,
    optimizedHtml,
    issues,
  };
}
