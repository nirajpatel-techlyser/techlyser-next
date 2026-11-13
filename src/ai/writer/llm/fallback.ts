import type { WriterLlmPayload, WriterInput } from "../types";
import { WRITER_LENGTH_WORD_TARGETS } from "../config";
import { slugifyTaxonomy } from "@/lib/blog-html";
import { WRITER_DEFAULT_CTA } from "../config";

function section(title: string, body: string) {
  return `## ${title}\n\n${body}\n`;
}

export function generateFallbackPayload(input: WriterInput): WriterLlmPayload {
  const targetWords = WRITER_LENGTH_WORD_TARGETS[input.length];
  const slugBase = slugifyTaxonomy(input.keyword) || "techlyser-article";
  const slug = slugBase.slice(0, 80);

  const articleMarkdown = [
    section(
      `Why ${input.keyword} matters for ${input.audience}`,
      `This guide explains ${input.keyword} for ${input.audience} in plain business language: what breaks, what to measure, and what to fix first — without filler or a sales pitch.`,
    ),
    section(
      "Key considerations before you start",
      `- Define success metrics (conversion, leads, speed, retention, or operational efficiency)\n- Map integrations (ERP, CRM, payments, analytics)\n- Choose build vs. migrate vs. optimize based on ${input.searchIntent} intent\n- Budget for discovery, implementation, QA, and launch support`,
    ),
    section(
      "Recommended approach",
      `For ${input.searchIntent} searches, prioritize clarity: scope the MVP, document assumptions, and sequence work across product, performance, and SEO. Aim for practical depth (~${targetWords} words of useful guidance) without padding.`,
    ),
    section(
      "Common mistakes to avoid",
      `Skipping discovery, stacking too many tools, ignoring mobile performance, and measuring vanity metrics instead of leads/sales usually create rework. Fix ownership and success criteria before choosing technology.`,
    ),
    section(
      "Next steps",
      `Use the checklist and FAQs below to decide what you can do in-house versus what needs specialized help for ${input.keyword}.`,
    ),
  ].join("\n");

  const outline = [
    `- Why ${input.keyword} matters for ${input.audience}`,
    `- Key considerations before you start`,
    `- Recommended approach`,
    `- Common mistakes to avoid`,
    `- Next steps`,
    `- FAQs`,
  ].join("\n");

  return {
    seoTitle: `${input.keyword} — Guide for ${input.audience}`.slice(0, 60),
    metaDescription: `Learn ${input.keyword} for ${input.audience}. Practical ${input.category} guidance — planning, trade-offs, and clear next steps.`.slice(
      0,
      160,
    ),
    slug,
    outline,
    excerpt: `A ${input.tone} guide to ${input.keyword} for ${input.audience}, covering planning, execution, and common mistakes.`,
    articleMarkdown,
    faqs: [
      {
        question: `What is ${input.keyword}?`,
        answer: `${input.keyword} covers the strategy, tooling, and execution required to deliver outcomes for ${input.audience}. Scope varies by stack, integrations, and timeline.`,
      },
      {
        question: `How long does ${input.keyword} take?`,
        answer: `Most projects run several weeks to a few months depending on complexity, content volume, and approval cycles. Discovery should happen before fixed dates are promised.`,
      },
      {
        question: "What does it typically cost?",
        answer:
          "Budget depends on scope: audits and small fixes differ from full rebuilds or platform migrations. Compare scoped outcomes, not hourly rates alone.",
      },
      {
        question: "When do we need outside help?",
        answer:
          "Bring in specialists when internal capacity, platform expertise, or launch deadlines exceed what your team can absorb — especially for integrations, performance, and QA.",
      },
    ],
    howTo:
      input.searchIntent === "informational"
        ? {
            name: `How to plan ${input.keyword}`,
            description: `Step-by-step planning guide for ${input.audience}.`,
            steps: [
              {
                name: "Define goals",
                text: "Document business outcomes, KPIs, and constraints.",
              },
              {
                name: "Audit current stack",
                text: "List platforms, apps, data flows, and pain points.",
              },
              {
                name: "Prioritize scope",
                text: "Sequence must-have vs. nice-to-have for launch.",
              },
              {
                name: "Decide ownership",
                text: "Clarify what your team owns vs where specialist help reduces risk.",
              },
            ],
          }
        : null,
    comparisonTable:
      input.searchIntent === "commercial" ||
      input.searchIntent === "transactional"
        ? {
            headers: ["Option", "Best for", "Trade-offs"],
            rows: [
              [
                "In-house team",
                "Ongoing maintenance",
                "Slower on specialized platform work",
              ],
              [
                "Freelancer",
                "Small, well-defined tasks",
                "Limited bandwidth for complex integrations",
              ],
              [
                "Specialist partner",
                "End-to-end builds and migrations",
                "Needs clear discovery and milestones",
              ],
            ],
          }
        : null,
    cta: { ...WRITER_DEFAULT_CTA },
    featuredImagePrompt: `Professional blog hero image about ${input.keyword}, modern business workspace, clean composition, no text, photorealistic, 16:9`,
    tags: [
      slugifyTaxonomy(input.category),
      slugifyTaxonomy(input.keyword.split(" ")[0] || "business"),
      "digital-growth",
    ].filter(Boolean),
    linkedinPersonalPost: [
      `I've been getting a lot of questions about ${input.keyword}.`,
      ``,
      `For ${input.audience}, the biggest unlock is usually clarity: the real problem, the metric that matters, and what to fix first — not the flashiest tool.`,
      ``,
      `We published a practical guide covering what to check before you start.`,
      ``,
      `If you're evaluating this right now, what is the hardest part for you?`,
      ``,
      `#DigitalGrowth #${slugifyTaxonomy(input.category).replace(/-/g, "")}`,
    ].join("\n"),
    linkedinPagePost: [
      `New guide: ${input.keyword}`,
      ``,
      `Built for ${input.audience} who need a clear path from planning to action — without the fluff.`,
      ``,
      `Inside: practical considerations, common mistakes, and decision checkpoints.`,
      ``,
      `What would you add to the checklist?`,
      ``,
      `#BusinessGrowth #${slugifyTaxonomy(input.category).replace(/-/g, "")}`,
    ].join("\n"),
  };
}
