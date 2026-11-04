/**
 * Clear off-brand Vercel news from the queue and add fresh Shopify topics.
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
  {
    title: "Shopify checkout customization that stays upgrade-safe",
    slug: "shopify-checkout-customization-upgrade-safe",
    angle:
      "How brands extend checkout without breaking Plus upgrades: Checkout Extensibility, apps vs scripts, and when Techlyser should rebuild.",
    priority: 96,
    keywords: ["shopify checkout", "shopify plus", "checkout extensibility"],
  },
  {
    title: "When a Shopify theme rebuild pays for itself in 90 days",
    slug: "shopify-theme-rebuild-roi-90-days",
    angle:
      "ROI framework for founders: conversion lift, page speed, app debt removal, and maintenance cost after a custom theme rebuild.",
    priority: 95,
    keywords: ["shopify theme rebuild", "shopify conversion", "theme debt"],
  },
  {
    title: "Headless Shopify with Next.js: who actually needs it",
    slug: "headless-shopify-nextjs-who-needs-it",
    angle:
      "Clear decision guide for D2C brands: online store 2.0 vs Hydrogen/Next.js headless, cost, SEO, and team skills.",
    priority: 95,
    keywords: ["headless shopify", "next.js shopify", "hydrogen"],
  },
  {
    title: "Fixing Shopify Core Web Vitals without killing design",
    slug: "shopify-core-web-vitals-without-killing-design",
    angle:
      "Practical LCP/INP fixes on Shopify themes: image strategy, app audit, Liquid rendering, and what agencies should measure first.",
    priority: 94,
    keywords: ["shopify core web vitals", "shopify speed", "lcp"],
  },
  {
    title: "Shopify subscription and membership UX that does not hurt AOV",
    slug: "shopify-subscription-membership-ux-aov",
    angle:
      "Subscription UX patterns for Shopify: selling plans, PDP friction, retention offers, and common app stack mistakes.",
    priority: 93,
    keywords: ["shopify subscriptions", "selling plans", "aov"],
  },
  {
    title: "International Shopify stores: markets, duties, and theme pitfalls",
    slug: "international-shopify-markets-duties-theme",
    angle:
      "Markets setup, duties at checkout, multi-currency UX, and theme issues brands hit when expanding US/EU/AU.",
    priority: 93,
    keywords: ["shopify markets", "international ecommerce", "multi currency"],
  },
  {
    title: "Shopify collection page CRO for paid traffic",
    slug: "shopify-collection-page-cro-paid-traffic",
    angle:
      "Collection filters, merchandising, mobile density, and load behavior that waste Meta/Google ads for Shopify brands.",
    priority: 92,
    keywords: ["shopify collection page", "cro", "paid traffic"],
  },
  {
    title: "Migrating from WordPress WooCommerce to Shopify without SEO loss",
    slug: "woocommerce-to-shopify-migration-seo",
    angle:
      "Redirect maps, URL structure, reviews, and content migration checklist for brands moving to Shopify with Techlyser.",
    priority: 92,
    keywords: ["woocommerce to shopify", "shopify migration", "seo migration"],
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
        { title: { contains: "web gateway", mode: "insensitive" } },
      ],
    },
    data: { status: "REJECTED" },
  });

  const rejectedDup = await prisma.contentIdea.updateMany({
    where: {
      blogId: null,
      title: {
        equals: "How founders should brief a Shopify agency for CRO and growth work",
      },
    },
    data: { status: "REJECTED" },
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
        targetWords: 1700,
        metadata: { keywords: idea.keywords, pillars: ["shopify-growth"] },
      },
    });
    created += 1;
  }

  const next = await selectGrowthTopic();
  console.log(
    JSON.stringify(
      {
        rejectedNews: rejectedNews.count,
        rejectedDuplicate: rejectedDup.count,
        created,
        skipped,
        nextTopic: next
          ? {
              title: next.topic.title,
              score: next.result.decision.techlyserGrowthScore,
              accepted: next.result.decision.accepted,
            }
          : null,
      },
      null,
      2,
    ),
  );
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : "refill failed");
  await prisma.$disconnect();
  process.exit(1);
});
