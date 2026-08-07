export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[^;]+;/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function slugifyTaxonomy(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Inject ids into h2/h3 and return TOC items for in-article navigation. */
export function enhanceHtmlWithHeadingIds(html: string): {
  html: string;
  toc: TocItem[];
} {
  const toc: TocItem[] = [];
  const used = new Set<string>();

  const enhanced = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_match, levelStr: string, attrs: string, inner: string) => {
      const level = Number(levelStr) as 2 | 3;
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (!text) return _match;

      let id = slugifyHeading(text) || `section-${toc.length + 1}`;
      if (used.has(id)) {
        id = `${id}-${toc.length + 1}`;
      }
      used.add(id);
      toc.push({ id, text, level });

      if (/\sid\s*=/.test(attrs)) {
        return `<h${level}${attrs}>${inner}</h${level}>`;
      }
      return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    },
  );

  return { html: enhanced, toc };
}

export function estimateWordCount(html: string) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(" ").length;
}
