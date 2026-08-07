import type { TocItem } from "@/lib/blog-html";
import type {
  WriterComparisonTable,
  WriterCta,
  WriterFaq,
  WriterHowTo,
} from "../types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderTocNav(toc: TocItem[]): string {
  if (toc.length === 0) return "";

  const items = toc
    .map(
      (item) =>
        `<li class="toc-level-${item.level}"><a href="#${item.id}">${escapeHtml(item.text)}</a></li>`,
    )
    .join("\n");

  return `<nav class="blog-toc" aria-label="Table of contents"><h2>Table of contents</h2><ol>${items}</ol></nav>`;
}

export function renderFaqSection(faqs: WriterFaq[]): string {
  if (!faqs.length) return "";

  const blocks = faqs
    .map(
      (faq) =>
        `<div class="faq-item"><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></div>`,
    )
    .join("\n");

  return `<section class="faq-section"><h2>Frequently asked questions</h2>${blocks}</section>`;
}

export function renderHowToSection(howTo?: WriterHowTo): string {
  if (!howTo?.steps?.length) return "";

  const steps = howTo.steps
    .map(
      (step, index) =>
        `<li><strong>${index + 1}. ${escapeHtml(step.name)}</strong> — ${escapeHtml(step.text)}</li>`,
    )
    .join("\n");

  return `<section class="howto-section"><h2>${escapeHtml(howTo.name)}</h2><p>${escapeHtml(howTo.description)}</p><ol>${steps}</ol></section>`;
}

export function renderComparisonTable(table?: WriterComparisonTable): string {
  if (!table?.headers?.length || !table.rows?.length) return "";

  const head = table.headers
    .map((cell) => `<th>${escapeHtml(cell)}</th>`)
    .join("");
  const body = table.rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
    )
    .join("\n");

  return `<section class="comparison-section"><h2>Comparison</h2><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></section>`;
}

export function renderCtaBlock(cta: WriterCta): string {
  const href = cta.href.startsWith("/") ? cta.href : "/contact";
  return `<section class="blog-cta"><h2>${escapeHtml(cta.headline)}</h2><p>${escapeHtml(cta.body)}</p><p><a href="${escapeHtml(href)}" class="btn-primary">${escapeHtml(cta.buttonText)}</a></p></section>`;
}

export function assembleArticleHtml(parts: {
  bodyHtml: string;
  toc: TocItem[];
  faqs: WriterFaq[];
  howTo?: WriterHowTo;
  comparisonTable?: WriterComparisonTable;
  cta: WriterCta;
}): string {
  return [
    renderTocNav(parts.toc),
    parts.bodyHtml,
    renderHowToSection(parts.howTo),
    renderComparisonTable(parts.comparisonTable),
    renderFaqSection(parts.faqs),
    renderCtaBlock(parts.cta),
  ]
    .filter(Boolean)
    .join("\n\n");
}
