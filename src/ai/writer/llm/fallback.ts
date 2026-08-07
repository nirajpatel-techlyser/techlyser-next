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
      `This guide explains ${input.keyword} for ${input.audience} with a ${input.tone} tone. Techlyser teams in India help brands plan, build, and scale Shopify and headless commerce projects with clear timelines and measurable outcomes.`,
    ),
    section(
      "Key considerations before you start",
      `- Define success metrics (conversion, AOV, speed, or operational efficiency)\n- Map integrations (ERP, CRM, payments, analytics)\n- Choose build vs. migrate vs. optimize based on ${input.searchIntent} intent\n- Budget for discovery, implementation, QA, and launch support`,
    ),
    section(
      "Recommended approach",
      `For ${input.searchIntent} searches, prioritize clarity: scope the MVP, document assumptions, and sequence work across theme, apps, performance, and SEO. A typical ${input.length} engagement targets roughly ${targetWords} words of depth — enough to answer objections without filler.`,
    ),
    section(
      "What to expect from an agency partner",
      `Look for Shopify Plus or Next.js experience, transparent milestones, and post-launch optimization. Techlyser combines engineering with ecommerce strategy so ${input.audience} can ship faster with fewer rework cycles.`,
    ),
    section(
      "Next steps",
      `Use the checklist below, review FAQs, and book a consultation if you need a tailored roadmap for ${input.keyword}.`,
    ),
  ].join("\n");

  const outline = [
    `- Why ${input.keyword} matters for ${input.audience}`,
    `- Key considerations before you start`,
    `- Recommended approach`,
    `- What to expect from an agency partner`,
    `- Next steps`,
    `- FAQs`,
  ].join("\n");

  return {
    seoTitle: `${input.keyword} — Guide for ${input.audience}`.slice(0, 60),
    metaDescription: `Learn ${input.keyword} for ${input.audience}. Practical ${input.category} guidance from Techlyser — timelines, costs, and next steps.`.slice(
      0,
      160,
    ),
    slug,
    outline,
    excerpt: `A ${input.tone} guide to ${input.keyword} for ${input.audience}, covering planning, execution, and when to engage experts.`,
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
        question: "What does it typically cost in India?",
        answer:
          "Budget depends on scope: audits and small fixes differ from full rebuilds or headless migrations. Request a scoped estimate rather than comparing hourly rates alone.",
      },
      {
        question: "When should we hire an agency?",
        answer:
          "Hire when internal capacity, platform expertise, or launch deadlines exceed what your team can absorb. Agencies reduce risk on integrations, performance, and QA.",
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
                name: "Select a partner",
                text: "Evaluate Shopify/Next.js experience, process, and references.",
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
                "Agency (Techlyser)",
                "End-to-end Shopify / headless builds",
                "Requires discovery and structured milestones",
              ],
            ],
          }
        : null,
    cta: { ...WRITER_DEFAULT_CTA },
    featuredImagePrompt: `Professional blog hero image about ${input.keyword}, modern ecommerce workspace, subtle Techlyser brand colors (deep blue and white), clean composition, no text, photorealistic, 16:9`,
    tags: [
      slugifyTaxonomy(input.category),
      slugifyTaxonomy(input.keyword.split(" ")[0] || "commerce"),
      "techlyser",
    ].filter(Boolean),
  };
}
