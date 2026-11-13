import type { SeoFaqItem, SeoFaqResult, SeoModuleContext } from "../types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function extractExistingFaqs(html: string): SeoFaqItem[] {
  const faqs: SeoFaqItem[] = [];
  const faqSection = html.match(
    /<section[^>]*class=["'][^"']*faq[^"']*["'][^>]*>([\s\S]*?)<\/section>/i,
  );
  const block = faqSection?.[1] || html;

  const itemRe =
    /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(block)) !== null) {
    const question = match[1].replace(/<[^>]+>/g, "").trim();
    const answer = match[2].replace(/<[^>]+>/g, "").trim();
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

function synthesizeFaqs(ctx: SeoModuleContext): SeoFaqItem[] {
  const kw = ctx.primaryKeyword;
  return [
    {
      question: `What is ${kw}?`,
      answer: `${kw} covers the strategy, tooling, and execution choices that help businesses improve visibility, experience, and growth outcomes.`,
    },
    {
      question: `Who should consider ${kw}?`,
      answer: `Founders, marketing leads, and technical teams facing slow sites, weak conversion, outdated systems, or unclear digital priorities related to ${kw}.`,
    },
    {
      question: `What should you do first with ${kw}?`,
      answer:
        "Start with discovery: clarify goals, audit the current stack, define success metrics, then sequence practical milestones with QA and SEO safeguards.",
    },
  ];
}

export function optimizeFaq(ctx: SeoModuleContext): SeoFaqResult {
  const issues: string[] = [];
  let faqs = extractExistingFaqs(ctx.content);

  if (faqs.length === 0) {
    faqs = synthesizeFaqs(ctx);
    issues.push("Generated starter FAQ block (no existing FAQ section found)");
  } else if (faqs.length < 3) {
    issues.push("Fewer than 3 FAQs found — consider expanding for AI Overviews");
  }

  const faqHtml = [
    `<section class="faq-section"><h2>Frequently asked questions</h2>`,
    ...faqs.map(
      (f) =>
        `<div class="faq-item"><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></div>`,
    ),
    `</section>`,
  ].join("\n");

  return { faqs, faqHtml, issues };
}
