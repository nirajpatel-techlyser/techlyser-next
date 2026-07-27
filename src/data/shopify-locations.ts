export type ShopifyLocation = {
  slug: string;
  city: string;
  region: string;
  headline: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  highlights: string[];
  keywords: string[];
};

export const shopifyIndiaHub = {
  path: "/shopify-developers-india",
  headline: "Shopify Developers in India — Best Shopify Agency for Growth Brands",
  metaTitle: "Shopify Developers India",
  metaDescription:
    "Techlyser is a leading Shopify development agency in India. Custom Shopify stores, migrations, Shopify Plus, performance, and SEO for brands in Indore, Mumbai, Ahmedabad, Bangalore, Gujarat, and nationwide.",
  intro:
    "We partner with D2C brands, retailers, and B2B merchants who need a Shopify partner that ships fast, optimizes conversion, and keeps stores maintainable. Remote-first across India with the same delivery standards you expect from a top Shopify agency.",
};

export const shopifyLocations: ShopifyLocation[] = [
  {
    slug: "indore",
    city: "Indore",
    region: "Madhya Pradesh",
    headline: "Shopify Developers in Indore",
    metaTitle: "Shopify Developers Indore",
    metaDescription:
      "Hire Shopify developers in Indore for custom themes, store rebuilds, migrations, and Shopify Plus. Techlyser delivers conversion-focused ecommerce for Central India brands.",
    intro:
      "Based in India with strong delivery for Indore and Madhya Pradesh businesses, we help local brands launch and scale on Shopify without compromising speed or UX.",
    highlights: [
      "Custom Shopify themes tuned for Indian checkout habits",
      "COD, UPI, and local shipping integrations",
      "Launch support for new D2C brands in MP",
    ],
    keywords: [
      "Shopify developers Indore",
      "Shopify agency Indore",
      "Shopify development Indore",
    ],
  },
  {
    slug: "mumbai",
    city: "Mumbai",
    region: "Maharashtra",
    headline: "Shopify Developers in Mumbai",
    metaTitle: "Shopify Developers Mumbai",
    metaDescription:
      "Shopify developers in Mumbai for high-growth brands. Custom storefronts, catalog scale, integrations, and performance optimization from Techlyser.",
    intro:
      "Mumbai brands move fast — we match that pace with structured discovery, premium storefront UX, and reliable go-live playbooks for ecommerce teams.",
    highlights: [
      "Enterprise-ready theme architecture",
      "Multi-location inventory and B2B flows",
      "CRO-focused product and collection templates",
    ],
    keywords: [
      "Shopify developers Mumbai",
      "Shopify agency Mumbai",
      "Shopify experts Mumbai",
    ],
  },
  {
    slug: "ahmedabad",
    city: "Ahmedabad",
    region: "Gujarat",
    headline: "Shopify Developers in Ahmedabad",
    metaTitle: "Shopify Developers Ahmedabad",
    metaDescription:
      "Shopify developers in Ahmedabad and Gujarat for custom stores, migrations, and SEO. Techlyser builds Shopify experiences that convert.",
    intro:
      "We support Ahmedabad and Gujarat merchants with Shopify builds that respect catalog complexity, regional logistics, and seasonal campaign velocity.",
    highlights: [
      "Wholesale and retail hybrid storefronts",
      "Festive campaign landing pages at speed",
      "Theme performance for mobile-first buyers",
    ],
    keywords: [
      "Shopify developers Ahmedabad",
      "Shopify agency Ahmedabad",
      "Shopify developers Gujarat",
    ],
  },
  {
    slug: "gujarat",
    city: "Gujarat",
    region: "India",
    headline: "Shopify Developers in Gujarat",
    metaTitle: "Shopify Developers Gujarat",
    metaDescription:
      "Shopify development company for Gujarat — Ahmedabad, Surat, Vadodara, and statewide brands. Custom Shopify, migrations, and growth from Techlyser.",
    intro:
      "From Surat to Vadodara, we help Gujarat businesses standardize on Shopify with maintainable themes, clear merchandising, and measurable conversion improvements.",
    highlights: [
      "Statewide remote delivery with shared Slack/Notion workflows",
      "Catalog and variant structures for manufacturing-led brands",
      "Ongoing optimization retainers after launch",
    ],
    keywords: [
      "Shopify developers Gujarat",
      "Shopify agency Gujarat",
      "Shopify development Gujarat",
    ],
  },
  {
    slug: "bangalore",
    city: "Bangalore",
    region: "Karnataka",
    headline: "Shopify Developers in Bangalore",
    metaTitle: "Shopify Developers Bangalore",
    metaDescription:
      "Shopify developers in Bangalore (Bengaluru) for SaaS-adjacent D2C, subscriptions, and Shopify Plus. Techlyser builds scalable ecommerce products.",
    intro:
      "Bangalore teams expect clean engineering — we bring Liquid discipline, integration hygiene, and analytics-ready storefronts for modern ecommerce operators.",
    highlights: [
      "Subscription and membership commerce",
      "Headless-ready theme foundations",
      "Experimentation-friendly PDP and cart flows",
    ],
    keywords: [
      "Shopify developers Bangalore",
      "Shopify developers Bengaluru",
      "Shopify agency Bangalore",
    ],
  },
];

export const shopifyIndiaFaqs = [
  {
    question: "Why hire Shopify developers in India?",
    answer:
      "India offers deep Shopify talent, faster iteration cycles, and strong value for custom theme work, migrations, and ongoing optimization. Techlyser combines agency-level UX with engineering discipline so your store stays fast and maintainable.",
  },
  {
    question: "Do you work with brands outside Indore, Mumbai, and other cities?",
    answer:
      "Yes. We are remote-first across India and work with clients worldwide. City pages reflect where many of our clients search from; delivery is the same high standard regardless of location.",
  },
  {
    question: "What makes Techlyser a strong Shopify agency in India?",
    answer:
      "We focus on conversion, Core Web Vitals, clean theme architecture, and SEO foundations — not just visual design. You get clear milestones, launch QA, and post-launch optimization support.",
  },
  {
    question: "Can you migrate WooCommerce, Magento, or custom stores to Shopify?",
    answer:
      "Yes. We plan URL redirects, preserve SEO equity, migrate catalog and customer data where applicable, and run staged QA before cutover.",
  },
];

export function getShopifyLocationBySlug(
  slug: string,
): ShopifyLocation | undefined {
  return shopifyLocations.find((item) => item.slug === slug);
}

export function getAllShopifyLocationSlugs(): string[] {
  return shopifyLocations.map((item) => item.slug);
}
