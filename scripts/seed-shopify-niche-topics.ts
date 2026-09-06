/**
 * Reject off-niche content ideas / opportunities and seed Shopify growth queue.
 * Also refreshes writer brand prompts in the database.
 *
 * Usage: npx tsx --env-file=.env.local scripts/seed-shopify-niche-topics.ts
 */
import { PrismaClient } from "@prisma/client";
import { isTechlyserNicheTopic } from "../src/ai/brand/niche";
import { seedWriterPrompts } from "../prisma/seed-writer-prompts";

const prisma = new PrismaClient();

const SEED_IDEAS: Array<{
  title: string;
  slug: string;
  angle: string;
  priority: number;
  targetWords: number;
}> = [
  {
    title: "Shopify CRO checklist for D2C founders who need more revenue, not more apps",
    slug: "shopify-cro-checklist-d2c-founders",
    angle:
      "Founder-first CRO prioritization for Shopify stores: what to fix first on PDP, cart, and checkout, with India-relevant examples.",
    priority: 98,
    targetWords: 1800,
  },
  {
    title: "How Shopify brands should run A/B tests without breaking conversion",
    slug: "shopify-ab-testing-without-breaking-conversion",
    angle:
      "Practical A/B testing playbook for Shopify: hypothesis design, sample size reality, theme risks, and when to hire specialists.",
    priority: 97,
    targetWords: 1700,
  },
  {
    title: "GEO and AEO for Shopify: get your store cited by AI answer engines",
    slug: "shopify-geo-aeo-ai-answer-engines",
    angle:
      "Generative/answer-engine optimization for Shopify brands — entity clarity, FAQ structure, product content that AI systems can cite.",
    priority: 97,
    targetWords: 1800,
  },
  {
    title: "Cart abandonment recovery on Shopify: what founders should fix this quarter",
    slug: "shopify-cart-abandonment-recovery-founders",
    angle:
      "Founder roadmap for reducing cart abandonment on Shopify — UX friction, trust, payments, and measurement.",
    priority: 96,
    targetWords: 1600,
  },
  {
    title: "Shopify checkout CRO: reduce drop-off for Indian ecommerce brands",
    slug: "shopify-checkout-cro-india",
    angle:
      "Checkout conversion tactics for India: UPI/COD trade-offs, trust signals, address UX, and Plus vs Online Store constraints.",
    priority: 96,
    targetWords: 1700,
  },
  {
    title: "How founders should brief a Shopify agency for CRO and growth work",
    slug: "brief-shopify-agency-cro-growth",
    angle:
      "A founder briefing template covering goals, analytics access, experiment backlog, and success metrics before hiring Shopify specialists.",
    priority: 95,
    targetWords: 1500,
  },
  {
    title: "Shopify store speed vs conversion: what to measure before a redesign",
    slug: "shopify-speed-vs-conversion-measure-first",
    angle:
      "Connect Core Web Vitals and theme performance to conversion outcomes so founders avoid redesign-only thinking.",
    priority: 95,
    targetWords: 1600,
  },
  {
    title: "Shopify Plus migration: when founders should upgrade and what breaks",
    slug: "shopify-plus-migration-when-founders-upgrade",
    angle:
      "Decision framework for Shopify Plus — checkout extensibility, B2B, international, cost, and migration risks.",
    priority: 94,
    targetWords: 1700,
  },
  {
    title: "Product page CRO on Shopify: PDP experiments that actually move AOV",
    slug: "shopify-pdp-cro-aov-experiments",
    angle:
      "PDP A/B testing ideas for Shopify brands — social proof, bundling, variants, and content hierarchy for founders and merchandisers.",
    priority: 94,
    targetWords: 1600,
  },
  {
    title: "Shopify Liquid performance patterns that protect Core Web Vitals",
    slug: "shopify-liquid-performance-core-web-vitals",
    angle:
      "Developer guide: Liquid/section patterns, image strategy, and script hygiene that keep Shopify themes fast and conversion-ready.",
    priority: 93,
    targetWords: 1700,
  },
  {
    title: "Building A/B testing infrastructure on Shopify for developers",
    slug: "shopify-ab-testing-infrastructure-developers",
    angle:
      "How developers instrument experiments on Shopify themes and headless storefronts without fragile hard-coded variants.",
    priority: 93,
    targetWords: 1700,
  },
  {
    title: "Headless Shopify with Next.js: when CRO gains justify the complexity",
    slug: "headless-shopify-nextjs-cro-tradeoffs",
    angle:
      "Founder + developer trade-off guide: when headless helps conversion/UX vs when a well-built Online Store theme wins.",
    priority: 92,
    targetWords: 1800,
  },
  {
    title: "Shopify metafields architecture for personalized product pages",
    slug: "shopify-metafields-personalized-pdp",
    angle:
      "Developer-oriented metafields/metaobjects patterns that enable personalization and cleaner CRO experiments on Shopify.",
    priority: 91,
    targetWords: 1600,
  },
  {
    title: "Schema, FAQs, and GEO-ready content for Shopify blogs and PDPs",
    slug: "shopify-schema-faq-geo-content",
    angle:
      "Implementation guide for FAQ/HowTo/Product schema and AI-citable content structures on Shopify.",
    priority: 91,
    targetWords: 1500,
  },
  {
    title: "Shopify app vs custom code for CRO experiments: decision guide",
    slug: "shopify-app-vs-custom-code-cro",
    angle:
      "When founders and developers should use apps vs custom theme/code for experiments, and how Techlyser scopes the work.",
    priority: 90,
    targetWords: 1500,
  },
  {
    title: "Quarterly Shopify growth roadmap for D2C founders",
    slug: "quarterly-shopify-growth-roadmap-d2c",
    angle:
      "A 90-day growth roadmap covering CRO, GEO, retention, and technical debt prioritization for Shopify brands.",
    priority: 90,
    targetWords: 1600,
  },
];

async function rejectOffNicheIdeas() {
  const open = await prisma.contentIdea.findMany({
    where: {
      blogId: null,
      status: { in: ["DRAFT", "QUEUED", "APPROVED"] },
    },
    select: {
      id: true,
      title: true,
      angle: true,
      metadata: true,
    },
  });

  let rejected = 0;
  for (const idea of open) {
    const meta = idea.metadata as { keywords?: string[] } | null;
    const ok = isTechlyserNicheTopic(
      idea.title,
      idea.angle,
      ...(meta?.keywords || []),
    );
    if (ok) continue;
    await prisma.contentIdea.update({
      where: { id: idea.id },
      data: {
        status: "REJECTED",
        metadata: {
          ...(typeof idea.metadata === "object" && idea.metadata
            ? (idea.metadata as object)
            : {}),
          rejectedReason: "off-niche: not Shopify/ecommerce growth",
          rejectedAt: new Date().toISOString(),
        },
      },
    });
    rejected += 1;
  }
  return rejected;
}

async function dismissOffNicheOpportunities() {
  const rows = await prisma.opportunity.findMany({
    where: { status: { in: ["NEW", "REVIEWED", "QUEUED"] } },
    select: {
      id: true,
      title: true,
      summary: true,
      category: true,
      keywords: true,
    },
  });

  let dismissed = 0;
  for (const row of rows) {
    const ok = isTechlyserNicheTopic(
      row.title,
      row.summary,
      row.category,
      ...(row.keywords || []),
    );
    if (ok) continue;
    await prisma.opportunity.update({
      where: { id: row.id },
      data: { status: "DISMISSED" },
    });
    dismissed += 1;
  }
  return dismissed;
}

async function seedIdeas() {
  let created = 0;
  let skipped = 0;
  for (const idea of SEED_IDEAS) {
    const existing = await prisma.contentIdea.findFirst({
      where: {
        OR: [{ slug: idea.slug }, { title: idea.title }],
      },
      select: { id: true, blogId: true, status: true },
    });

    if (existing?.blogId) {
      skipped += 1;
      continue;
    }

    if (existing) {
      await prisma.contentIdea.update({
        where: { id: existing.id },
        data: {
          title: idea.title,
          slug: idea.slug,
          angle: idea.angle,
          status: "QUEUED",
          priority: idea.priority,
          targetWords: idea.targetWords,
          metadata: {
            source: "techlyser-niche-seed",
            pillars: ["shopify-growth", "cro", "geo", "ab-testing"],
          },
        },
      });
      created += 1;
      continue;
    }

    await prisma.contentIdea.create({
      data: {
        title: idea.title,
        slug: idea.slug,
        angle: idea.angle,
        status: "QUEUED",
        priority: idea.priority,
        targetWords: idea.targetWords,
        metadata: {
          source: "techlyser-niche-seed",
          pillars: ["shopify-growth", "cro", "geo", "ab-testing"],
        },
      },
    });
    created += 1;
  }
  return { created, skipped };
}

async function main() {
  await seedWriterPrompts(prisma);
  const rejected = await rejectOffNicheIdeas();
  const dismissed = await dismissOffNicheOpportunities();
  const seeded = await seedIdeas();

  const next = await prisma.contentIdea.findFirst({
    where: {
      blogId: null,
      status: { in: ["QUEUED", "APPROVED", "DRAFT"] },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    select: { title: true, priority: true, status: true },
  });

  console.log(
    JSON.stringify(
      {
        rejectedIdeas: rejected,
        dismissedOpportunities: dismissed,
        seededIdeas: seeded,
        nextAutopilotTopic: next,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
