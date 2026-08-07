export type ResourceLink = {
  title: string;
  description: string;
  href: string;
  badge?: string;
};

export type ResourceCluster = {
  title: string;
  description: string;
  pillarHref: string;
  articles: ResourceLink[];
};

/** Free Resources hub — pillar pages + published cluster articles. */
export const resourceHero = {
  title: "Free Shopify & Ecommerce Resources",
  description:
    "Guides, checklists, and playbooks from Techlyser — built for Indian brands choosing Shopify, Shopify Plus, headless commerce, and growth partners.",
};

export const leadMagnets: ResourceLink[] = [
  {
    title: "Free Shopify Growth Audit",
    description:
      "We review performance, UX, conversion, accessibility, and SEO — then fix the first two high-impact issues where feasible.",
    href: "/free-shopify-audit",
    badge: "Lead magnet",
  },
  {
    title: "Shopify Developers India hub",
    description:
      "Nationwide Shopify agency guide with city pages for Indore, Mumbai, Ahmedabad, Bangalore, Pune, Delhi, Hyderabad, Chennai, and Gujarat.",
    href: "/shopify-developers-india",
    badge: "Pillar",
  },
];

export const resourceClusters: ResourceCluster[] = [
  {
    title: "Shopify Developers India",
    description:
      "How to hire, what Shopify Plus unlocks, and how to choose an agency that ships conversion-ready stores.",
    pillarHref: "/shopify-developers-india",
    articles: [
      {
        title: "Hire Shopify developers in India: cost, timeline & checklist",
        description:
          "Budget ranges, delivery timelines, red flags, and a practical hiring scorecard.",
        href: "/hire-shopify-developers-india-cost-timeline-checklist",
      },
      {
        title: "Shopify Plus vs Shopify for Indian brands",
        description:
          "When Plus is worth it for volume, B2B, checkout extensibility, and multi-store ops.",
        href: "/shopify-plus-vs-shopify-indian-brands",
      },
    ],
  },
  {
    title: "Headless & Next.js",
    description:
      "When headless Shopify pays off — and how Next.js teams in India should approach SEO and performance.",
    pillarHref: "/services/nextjs",
    articles: [
      {
        title: "Next.js headless Shopify development in India",
        description:
          "ROI scenarios, stack choices, and how Techlyser builds headless storefronts that still rank.",
        href: "/nextjs-headless-shopify-development-india",
      },
    ],
  },
  {
    title: "Platform decisions",
    description:
      "Fair comparisons for Indian D2C and SMB teams choosing between Shopify and WooCommerce.",
    pillarHref: "/services/shopify",
    articles: [
      {
        title: "Shopify vs WooCommerce for Indian D2C (2026)",
        description:
          "Payments, COD, apps, total cost of ownership, and when each platform wins.",
        href: "/shopify-vs-woocommerce-india-2026",
      },
    ],
  },
];

export const resourceFaqs = [
  {
    question: "Are these resources free?",
    answer:
      "Yes. Guides on this page are free to read. The Free Shopify Growth Audit is a limited complimentary review for serious brands — not a DIY PDF dump.",
  },
  {
    question: "Who writes these guides?",
    answer:
      "Techlyser Web Solutions — a Shopify, Shopify Plus, Next.js, and WordPress agency based in India. Content reflects real delivery experience, not generic AI filler.",
  },
  {
    question: "Can I request a topic?",
    answer:
      "Yes. Contact us with the question your team is stuck on. High-intent topics often become the next published guide.",
  },
];
