import {
  enhanceHtmlWithHeadingIds,
  type TocItem,
} from "@/lib/blog-html";
import type { SeoHeadingResult, SeoModuleContext } from "../types";

function demoteH1ToH2(html: string): string {
  return html
    .replace(/<h1(\b[^>]*)>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>");
}

function ensureFirstH2(html: string, title: string): string {
  if (/<h2\b/i.test(html)) return html;
  const safe = title.replace(/</g, "").trim() || "Overview";
  return `<h2>${safe}</h2>\n${html}`;
}

export function optimizeHeadings(ctx: SeoModuleContext): SeoHeadingResult {
  const issues: string[] = [];
  let html = ctx.content || "";

  if (/<h1\b/i.test(html)) {
    html = demoteH1ToH2(html);
    issues.push("Demoted H1 to H2 (page title owns H1)");
  }

  html = ensureFirstH2(html, ctx.title);

  const { html: withIds, toc } = enhanceHtmlWithHeadingIds(html);

  let hierarchyValid = true;
  let lastLevel = 1;
  for (const item of toc) {
    if (item.level > lastLevel + 1) {
      hierarchyValid = false;
      issues.push(
        `Heading jump detected near "${item.text}" (h${lastLevel} → h${item.level})`,
      );
    }
    lastLevel = item.level;
  }

  if (toc.length === 0) {
    hierarchyValid = false;
    issues.push("No H2/H3 headings found after optimization");
  }

  return {
    hierarchyValid,
    issues,
    toc: toc as TocItem[],
    optimizedHtml: withIds,
  };
}
