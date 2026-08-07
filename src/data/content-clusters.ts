export type ContentCluster = {
  pillar: {
    title: string;
    path: string;
    intent: string;
  };
  supporting: { title: string; angle: string; href?: string; status: "published" | "planned" }[];
};

/** Editorial roadmap for topical authority (publish via CMS). */
export const contentClusters: ContentCluster[] = [
  {
    pillar: {
      title: "Shopify Developers India — Complete Guide",
      path: "/shopify-developers-india",
      intent: "Commercial + informational hub",
    },
    supporting: [
      {
        title: "Hire Shopify developers in India: cost, timeline & checklist",
        angle: "Buyer checklist + red flags",
        href: "/hire-shopify-developers-india-cost-timeline-checklist",
        status: "published",
      },
      {
        title: "Shopify Plus vs Shopify for Indian brands",
        angle: "Decision framework",
        href: "/shopify-plus-vs-shopify-indian-brands",
        status: "published",
      },
      {
        title: "Shopify migration SEO checklist",
        angle: "Redirects, CWV, schema",
        status: "planned",
      },
      {
        title: "Best Shopify apps for Indian D2C 2026",
        angle: "COD, UPI, logistics",
        status: "planned",
      },
      {
        title: "Shopify Core Web Vitals playbook",
        angle: "Theme + app bloat fixes",
        status: "planned",
      },
    ],
  },
  {
    pillar: {
      title: "Headless Commerce India",
      path: "/services/nextjs",
      intent: "Headless + Next.js commercial",
    },
    supporting: [
      {
        title: "Next.js headless Shopify development in India",
        angle: "ROI scenarios + SEO",
        href: "/nextjs-headless-shopify-development-india",
        status: "published",
      },
      {
        title: "Shopify Hydrogen vs Next.js headless",
        angle: "Stack comparison",
        status: "planned",
      },
      {
        title: "Headless SEO myths for ecommerce",
        angle: "SSR, metadata, crawl",
        status: "planned",
      },
    ],
  },
  {
    pillar: {
      title: "WordPress & WooCommerce Development India",
      path: "/services/wordpress",
      intent: "WordPress commercial",
    },
    supporting: [
      {
        title: "Shopify vs WooCommerce for Indian D2C (2026)",
        angle: "Fair comparison table",
        href: "/shopify-vs-woocommerce-india-2026",
        status: "published",
      },
      {
        title: "WordPress performance for lead-gen sites",
        angle: "CWV + hosting",
        status: "planned",
      },
    ],
  },
  {
    pillar: {
      title: "AI Automation Agency India",
      path: "/services",
      intent: "Emerging category",
    },
    supporting: [
      {
        title: "AI chatbots for Shopify support",
        angle: "Use cases + guardrails",
        status: "planned",
      },
      {
        title: "Automating Shopify ops with AI",
        angle: "Catalog, support, reporting",
        status: "planned",
      },
    ],
  },
];

export const publishedClusterArticles = contentClusters
  .flatMap((cluster) => cluster.supporting)
  .filter((item) => item.status === "published" && item.href);

export const priorityArticleIdeas = [
  "Shopify migration SEO checklist (URL map, CWV, schema)",
  "Best Shopify apps for Indian D2C 2026",
  "Shopify Core Web Vitals playbook",
  "How Techlyser runs a Free Shopify Growth Audit",
  "City guides deep-dives: Indore, Mumbai, Ahmedabad, Bangalore, Pune, Delhi, Hyderabad, Chennai",
];
