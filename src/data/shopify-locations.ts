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
  faqs?: { question: string; answer: string }[];
};

export const shopifyIndiaHub = {
  path: "/shopify-developers-india",
  headline: "Shopify Developers in India — Best Shopify Agency for Growth Brands",
  metaTitle: "Shopify Developers India | Best Shopify Agency",
  metaDescription:
    "Techlyser is a leading Shopify development agency in India. Custom Shopify stores, migrations, Shopify Plus, performance, and SEO for brands in Indore, Mumbai, Ahmedabad, Bangalore, Pune, Delhi, Hyderabad, Chennai, Gujarat, and nationwide.",
  intro:
    "We partner with D2C brands, retailers, and B2B merchants who need a Shopify partner that ships fast, optimizes conversion, and keeps stores maintainable. Remote-first across India with the same delivery standards you expect from a top Shopify agency.",
};

export const shopifyLocations: ShopifyLocation[] = [
  {
    slug: "indore",
    city: "Indore",
    region: "Madhya Pradesh",
    headline: "Shopify Developers in Indore",
    metaTitle: "Shopify Developers Indore | Techlyser",
    metaDescription:
      "Hire Shopify developers in Indore for custom themes, store rebuilds, migrations, and Shopify Plus. Techlyser delivers conversion-focused ecommerce for Central India brands.",
    intro:
      "Based in India with strong delivery for Indore and Madhya Pradesh businesses, we help local brands launch and scale on Shopify without compromising speed or UX. From first product upload to Shopify Plus readiness, Indore merchants get senior developers — not junior ticket-only support.",
    highlights: [
      "Custom Shopify themes tuned for Indian checkout habits",
      "COD, UPI, and local shipping integrations",
      "Launch support for new D2C brands in Madhya Pradesh",
      "Same-day collaboration overlap for Indore stakeholders",
    ],
    keywords: [
      "Shopify developers Indore",
      "Shopify agency Indore",
      "Shopify development Indore",
      "hire Shopify developers Indore",
    ],
    faqs: [
      {
        question: "Do you offer on-site Shopify workshops in Indore?",
        answer:
          "Yes. For larger builds we can schedule discovery or training sessions in Indore. Most delivery still runs asynchronously with daily updates so your team stays unblocked.",
      },
      {
        question: "Can Indore brands get Shopify Plus support?",
        answer:
          "Absolutely. We plan Plus migrations, checkout extensibility, and B2B catalogs for growing Central India brands ready for higher volume.",
      },
    ],
  },
  {
    slug: "mumbai",
    city: "Mumbai",
    region: "Maharashtra",
    headline: "Shopify Developers in Mumbai",
    metaTitle: "Shopify Developers Mumbai | Techlyser",
    metaDescription:
      "Shopify developers in Mumbai for high-growth brands. Custom storefronts, catalog scale, integrations, and performance optimization from Techlyser.",
    intro:
      "Mumbai brands move fast — we match that pace with structured discovery, premium storefront UX, and reliable go-live playbooks for ecommerce teams across fashion, beauty, F&B, and specialty retail.",
    highlights: [
      "Enterprise-ready theme architecture",
      "Multi-location inventory and B2B flows",
      "CRO-focused product and collection templates",
      "Campaign landing pages for festive and influencer drops",
    ],
    keywords: [
      "Shopify developers Mumbai",
      "Shopify agency Mumbai",
      "Shopify experts Mumbai",
      "Shopify Plus Mumbai",
    ],
    faqs: [
      {
        question: "How quickly can Mumbai brands start a Shopify rebuild?",
        answer:
          "Discovery can begin within a week. Typical rebuilds land in 3–6 weeks depending on catalog complexity, apps, and design scope.",
      },
    ],
  },
  {
    slug: "ahmedabad",
    city: "Ahmedabad",
    region: "Gujarat",
    headline: "Shopify Developers in Ahmedabad",
    metaTitle: "Shopify Developers Ahmedabad | Techlyser",
    metaDescription:
      "Shopify developers in Ahmedabad and Gujarat for custom stores, migrations, and SEO. Techlyser builds Shopify experiences that convert.",
    intro:
      "We support Ahmedabad and Gujarat merchants with Shopify builds that respect catalog complexity, regional logistics, and seasonal campaign velocity — especially for manufacturing-led and wholesale-hybrid brands.",
    highlights: [
      "Wholesale and retail hybrid storefronts",
      "Festive campaign landing pages at speed",
      "Theme performance for mobile-first buyers",
      "Migration from Magento / WooCommerce with redirect maps",
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
    metaTitle: "Shopify Developers Gujarat | Techlyser",
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
    metaTitle: "Shopify Developers Bangalore | Techlyser",
    metaDescription:
      "Shopify developers in Bangalore (Bengaluru) for SaaS-adjacent D2C, subscriptions, and Shopify Plus. Techlyser builds scalable ecommerce products.",
    intro:
      "Bangalore teams expect clean engineering — we bring Liquid discipline, integration hygiene, and analytics-ready storefronts for modern ecommerce operators and product-led brands.",
    highlights: [
      "Subscription and membership commerce",
      "Headless-ready theme foundations",
      "Experimentation-friendly PDP and cart flows",
      "API-first integrations with CRMs and data stacks",
    ],
    keywords: [
      "Shopify developers Bangalore",
      "Shopify developers Bengaluru",
      "Shopify agency Bangalore",
      "Headless Shopify Bangalore",
    ],
  },
  {
    slug: "pune",
    city: "Pune",
    region: "Maharashtra",
    headline: "Shopify Developers in Pune",
    metaTitle: "Shopify Developers Pune | Techlyser",
    metaDescription:
      "Hire Shopify developers in Pune for custom themes, migrations, Shopify Plus, and conversion optimization. Techlyser builds growth-ready stores for Maharashtra brands.",
    intro:
      "Pune’s product and D2C scene needs Shopify partners who understand both design craft and engineering discipline. Techlyser delivers storefronts that load fast, convert on mobile, and stay easy to merchandise.",
    highlights: [
      "Custom theme builds for lifestyle and specialty brands",
      "Checkout and payments tuned for Indian buyers",
      "Performance and Core Web Vitals remediation",
      "Retainer support for continuous CRO experiments",
    ],
    keywords: [
      "Shopify developers Pune",
      "Shopify agency Pune",
      "Shopify experts Pune",
      "hire Shopify developers Pune",
    ],
    faqs: [
      {
        question: "Do you support Pune startups launching on Shopify?",
        answer:
          "Yes. We help early-stage brands with MVP storefronts, payment setup, and a clear roadmap to scale into custom themes or Plus when traction arrives.",
      },
    ],
  },
  {
    slug: "delhi",
    city: "Delhi",
    region: "Delhi NCR",
    headline: "Shopify Developers in Delhi NCR",
    metaTitle: "Shopify Developers Delhi | Techlyser",
    metaDescription:
      "Shopify developers in Delhi NCR for fashion, lifestyle, and multi-brand retail. Custom Shopify, Plus, migrations, and SEO from Techlyser.",
    intro:
      "Delhi NCR brands often juggle marketplaces, wholesale, and owned ecommerce. We build Shopify systems that unify catalog, brand experience, and conversion without slowing campaign velocity.",
    highlights: [
      "Multi-brand and marketplace-adjacent Shopify setups",
      "Fashion and lifestyle merchandising templates",
      "Festival campaign pages with reusable sections",
      "SEO foundations for competitive NCR keywords",
    ],
    keywords: [
      "Shopify developers Delhi",
      "Shopify agency Delhi NCR",
      "Shopify developers Gurgaon",
      "Shopify experts Noida",
    ],
  },
  {
    slug: "hyderabad",
    city: "Hyderabad",
    region: "Telangana",
    headline: "Shopify Developers in Hyderabad",
    metaTitle: "Shopify Developers Hyderabad | Techlyser",
    metaDescription:
      "Shopify developers in Hyderabad for D2C, B2B, and Shopify Plus. Techlyser builds fast, conversion-focused ecommerce for Telangana brands.",
    intro:
      "Hyderabad’s tech-forward teams want measurable outcomes. We deliver Shopify builds with clear milestones, analytics instrumentation, and storefront architecture that supports growth and experimentation.",
    highlights: [
      "B2B and wholesale pricing on Shopify",
      "Integration-friendly theme architecture",
      "Speed-first mobile UX",
      "Migration playbooks with QA checklists",
    ],
    keywords: [
      "Shopify developers Hyderabad",
      "Shopify agency Hyderabad",
      "Shopify Plus Hyderabad",
    ],
  },
  {
    slug: "chennai",
    city: "Chennai",
    region: "Tamil Nadu",
    headline: "Shopify Developers in Chennai",
    metaTitle: "Shopify Developers Chennai | Techlyser",
    metaDescription:
      "Hire Shopify developers in Chennai for custom stores, migrations, and performance. Techlyser is a Shopify agency serving Tamil Nadu and South India.",
    intro:
      "Chennai and South India brands trust Techlyser for Shopify launches that balance brand storytelling with operational reality — shipping rules, regional payments, and maintainable themes.",
    highlights: [
      "Custom Liquid themes with clean section architecture",
      "Regional logistics and payment configurations",
      "Accessibility-aware storefront UX",
      "Ongoing support retainers after go-live",
    ],
    keywords: [
      "Shopify developers Chennai",
      "Shopify agency Chennai",
      "Shopify development Tamil Nadu",
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
  {
    question: "Do you build headless Shopify with Next.js?",
    answer:
      "Yes. For brands that need custom UX beyond Liquid themes, we build headless and Hydrogen-ready storefronts with Next.js while keeping Shopify as the commerce engine.",
  },
  {
    question: "Is Techlyser a Shopify Plus partner-level team?",
    answer:
      "We deliver Shopify Plus storefronts, checkout extensibility, B2B catalogs, and multi-store architectures for high-growth merchants across India.",
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
