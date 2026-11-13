/**
 * Clear off-brand / exhausted queue items and seed business-outcome topics
 * across Shopify, WordPress, Next.js, React, PHP, and AngularJS.
 * Usage: npx tsx --env-file=.env.local scripts/refill-autopilot-topics.ts
 */
import { PrismaClient } from "@prisma/client";
import { selectGrowthTopic } from "../src/ai/growth-engine";

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

const FRESH: Array<{
  title: string;
  slug: string;
  angle: string;
  priority: number;
  keywords: string[];
}> = [
  // Shopify ~25%
  {
    title: "How Shopify can help retail businesses expand beyond their local market",
    slug: "shopify-retail-expand-beyond-local-market",
    angle:
      "Business outcome guide for local retailers: online catalog, checkout trust, delivery expectations, and when a Shopify rebuild beats a brochure site.",
    priority: 96,
    keywords: ["shopify retail", "local to online", "ecommerce growth"],
  },
  {
    title: "Shopify product page mistakes that quietly kill conversions",
    slug: "shopify-product-page-mistakes-kill-conversions",
    angle:
      "Practical PDP checklist for D2C founders: trust signals, mobile UX, speed, reviews placement, and app clutter Techlyser usually removes.",
    priority: 95,
    keywords: ["shopify product page", "conversion", "pdp ux"],
  },
  {
    title: "When Shopify store speed becomes a sales problem",
    slug: "when-shopify-store-speed-becomes-sales-problem",
    angle:
      "Connect Core Web Vitals and theme debt to lost carts, paid traffic waste, and a clear decision path for theme vs app cleanup.",
    priority: 94,
    keywords: ["shopify speed", "core web vitals", "cart abandonment"],
  },
  // WordPress ~15%
  {
    title: "How a WordPress website can generate better leads for service businesses",
    slug: "wordpress-website-better-leads-service-businesses",
    angle:
      "Lead-focused WordPress structure for local and service firms: landing pages, forms, SEO pages, trust content, and performance basics.",
    priority: 93,
    keywords: ["wordpress leads", "service business website", "landing pages"],
  },
  {
    title: "WordPress SEO foundations that improve online visibility without hacks",
    slug: "wordpress-seo-foundations-online-visibility",
    angle:
      "Business-friendly SEO on WordPress: intent pages, technical hygiene, internal links, and when a redesign beats more plugins.",
    priority: 92,
    keywords: ["wordpress seo", "online visibility", "technical seo"],
  },
  // Next.js ~15%
  {
    title: "How website performance influences customer experience and search visibility",
    slug: "website-performance-customer-experience-search-visibility",
    angle:
      "Explain why slow sites lose trust and rankings, and when Next.js is the right architecture for growth-focused businesses.",
    priority: 94,
    keywords: ["next.js performance", "customer experience", "search visibility"],
  },
  {
    title: "When a business should move from a traditional CMS site to Next.js",
    slug: "when-business-should-move-to-nextjs",
    angle:
      "Decision guide for founders: SEO needs, scalability, marketing velocity, hosting cost, and team skills before a Next.js rebuild.",
    priority: 93,
    keywords: ["next.js migration", "cms to next.js", "scalable website"],
  },
  // React ~10%
  {
    title: "How interactive React experiences improve customer engagement on business sites",
    slug: "react-interactive-experiences-customer-engagement",
    angle:
      "Business cases for React: portals, dashboards, product configurators, and engagement loops that static pages cannot support.",
    priority: 91,
    keywords: ["react.js", "customer engagement", "web application"],
  },
  // PHP ~10%
  {
    title: "How custom PHP applications can reduce manual work in growing businesses",
    slug: "custom-php-applications-reduce-manual-work",
    angle:
      "Operational efficiency angle: CRM-lite workflows, approvals, API integrations, and when custom PHP beats spreadsheets and generic SaaS.",
    priority: 92,
    keywords: ["php custom software", "workflow automation", "business operations"],
  },
  {
    title: "PHP API integrations that connect sales, support, and operations without chaos",
    slug: "php-api-integrations-sales-support-operations",
    angle:
      "Practical integration patterns for SMEs: CRM, payments, inventory sync, and ownership rules so systems stay maintainable.",
    priority: 90,
    keywords: ["php api integration", "crm", "operations efficiency"],
  },
  // AngularJS ~5%
  {
    title: "When to modernize an AngularJS app before technical debt blocks growth",
    slug: "modernize-angularjs-before-technical-debt-blocks-growth",
    angle:
      "Business continuity guide: security risk, hiring cost, performance, and staged modernization paths without a big-bang rewrite.",
    priority: 89,
    keywords: ["angularjs modernization", "legacy application", "technical debt"],
  },
  // Cross-tech ~20%
  {
    title: "Digital systems that help local businesses attract customers and build trust online",
    slug: "digital-systems-local-businesses-attract-customers-trust",
    angle:
      "Cross-stack playbook: website credibility, lead capture, speed, and choosing Shopify vs WordPress vs custom when budgets are tight.",
    priority: 91,
    keywords: ["local business website", "lead generation", "digital trust"],
  },
  {
    title: "How outdated websites quietly lose customers before the sales conversation starts",
    slug: "outdated-websites-lose-customers-before-sales",
    angle:
      "Founder-facing diagnosis: trust, mobile UX, page speed, and a practical rebuild roadmap across WordPress, Next.js, or Shopify.",
    priority: 92,
    keywords: ["outdated website", "customer trust", "website redesign"],
  },
];

async function main() {
  const rejectedNews = await prisma.contentIdea.updateMany({
    where: {
      blogId: null,
      status: { in: ["QUEUED", "APPROVED", "DRAFT"] },
      OR: [
        { title: { contains: "Vercel", mode: "insensitive" } },
        { title: { contains: "D1 ", mode: "insensitive" } },
        { title: { contains: "Muse Spark", mode: "insensitive" } },
        { title: { contains: "AI Gateway", mode: "insensitive" } },
        { title: { contains: "Token Pass", mode: "insensitive" } },
      ],
    },
    data: { status: "REJECTED" },
  });

  const rejectedOpps = await prisma.opportunity.updateMany({
    where: {
      status: { in: ["NEW", "REVIEWED", "QUEUED"] },
      contentIdeaId: null,
      OR: [
        { title: { contains: "Vercel", mode: "insensitive" } },
        { title: { contains: "AI Gateway", mode: "insensitive" } },
        { title: { contains: "OpenAI", mode: "insensitive" } },
        { title: { contains: "Cloudflare", mode: "insensitive" } },
        { title: { contains: "Token Pass", mode: "insensitive" } },
        { title: { contains: "Daemons", mode: "insensitive" } },
        { title: { contains: "Turbopack", mode: "insensitive" } },
      ],
    },
    data: { status: "DISMISSED" },
  });

  let created = 0;
  let skipped = 0;
  for (const idea of FRESH) {
    const exists = await prisma.contentIdea.findFirst({
      where: {
        OR: [{ title: idea.title }, { slug: idea.slug }],
      },
      select: { id: true },
    });
    if (exists) {
      skipped += 1;
      continue;
    }
    await prisma.contentIdea.create({
      data: {
        title: idea.title,
        slug: idea.slug,
        angle: idea.angle,
        status: "QUEUED",
        priority: idea.priority,
        targetWords: 1600,
        outline:
          "Business problem\nWhy it matters\nPractical recommendations\nTechnology fit\nCommon mistakes\nTechlyser CTA",
        metadata: {
          keywords: idea.keywords,
          stack: idea.keywords[0],
          source: "editorial-master-prompt-refill",
        },
      },
    });
    created += 1;
  }

  const selected = await selectGrowthTopic();
  console.log(
    JSON.stringify(
      {
        rejectedNews: rejectedNews.count,
        rejectedOpps: rejectedOpps.count,
        created,
        skipped,
        nextTopic: selected
          ? {
              title: selected.topic.title,
              keyword: selected.topic.keyword,
              score: selected.result.decision.techlyserGrowthScore,
              accepted: selected.result.decision.accepted,
            }
          : null,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
