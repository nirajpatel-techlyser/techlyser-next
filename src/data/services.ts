import {
  ShoppingBag,
  Code2,
  Globe,
  Palette,
  Gauge,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ServiceImage {
  src: string;
  alt: string;
}

export interface ServiceBenefit {
  title: string;
  description: string;
}

export interface ServiceProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface Service {
  id: number;
  slug: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  coverImage: string;
  coverAlt: string;
  heroHeadline: string;
  intro: string;
  overview: string[];
  benefits: ServiceBenefit[];
  deliverables: string[];
  process: ServiceProcessStep[];
  gallery: ServiceImage[];
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
}

const unsplash = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const services: Service[] = [
  {
    id: 1,
    slug: "shopify",
    icon: ShoppingBag,
    title: "Shopify Development",
    description:
      "High-converting Shopify stores designed for speed, scalability, and increased sales.",
    seoTitle: "Shopify Development India",
    seoDescription:
      "Custom Shopify development in India — themes, migrations, Shopify Plus, apps, speed, and SEO. Trusted Shopify developers for brands in Indore, Mumbai, Ahmedabad, Bangalore, and Gujarat.",
    keywords: [
      "Shopify development India",
      "Shopify developers India",
      "best Shopify agency",
      "Shopify Plus development",
      "custom Shopify theme",
    ],
    href: "/services/shopify",
    coverImage: unsplash("photo-1556742049-0cfed4f6a45d"),
    coverAlt: "Modern ecommerce checkout experience on a laptop",
    heroHeadline: "Shopify stores built to convert, scale, and sell more",
    intro:
      "From custom themes to Shopify Plus builds, we design and develop storefronts that load fast, feel premium, and turn visitors into loyal customers.",
    overview: [
      "Whether you are launching a new brand or rebuilding an underperforming store, our Shopify team focuses on conversion, performance, and maintainability. We combine clean Liquid and Hydrogen-ready architecture with UX that makes buying feel effortless.",
      "We handle theme customization, custom app integrations, checkout optimization, migration from other platforms, and ongoing store care — so your team can focus on products and growth instead of technical debt.",
    ],
    benefits: [
      {
        title: "Conversion-first themes",
        description:
          "Layouts, product pages, and carts engineered around clarity, trust, and checkout completion.",
      },
      {
        title: "Scalable architecture",
        description:
          "Clean theme structure and app stack that stays maintainable as catalogs and traffic grow.",
      },
      {
        title: "Shopify Plus ready",
        description:
          "Checkout extensibility, B2B flows, and multi-store setups for ambitious brands.",
      },
      {
        title: "Speed & SEO baked in",
        description:
          "Image strategy, critical CSS, and structured data so your store ranks and feels instant.",
      },
    ],
    deliverables: [
      "Custom Shopify theme or Hydrogen storefront",
      "Product, collection, and cart UX refinements",
      "App integrations (subscriptions, reviews, ERP, email)",
      "Migration support and launch QA",
      "Performance and Core Web Vitals pass",
      "Training for your merchandising team",
    ],
    process: [
      {
        step: "01",
        title: "Discovery & audit",
        description:
          "We map your catalog, goals, and current funnel — then define the right Shopify approach.",
      },
      {
        step: "02",
        title: "Design & prototype",
        description:
          "High-fidelity storefront concepts focused on merchandising and mobile conversion.",
      },
      {
        step: "03",
        title: "Build & integrate",
        description:
          "Theme development, apps, payments, and shipping configured for real-world operations.",
      },
      {
        step: "04",
        title: "Launch & optimize",
        description:
          "QA, go-live support, and iteration on speed, SEO, and conversion after launch.",
      },
    ],
    gallery: [
      {
        src: unsplash("photo-1441986300917-64674bd600d8", 900, 700),
        alt: "Retail brand storefront inspiration",
      },
      {
        src: unsplash("photo-1472851294608-062f824d29cc", 900, 700),
        alt: "Online shopping bags and packaging",
      },
      {
        src: unsplash("photo-1563013544-824ae1b704d3", 900, 700),
        alt: "Secure mobile payment experience",
      },
      {
        src: unsplash("photo-1607082348824-0a96f2a4b9da", 900, 700),
        alt: "Product photography for ecommerce catalogs",
      },
    ],
  },
  {
    id: 2,
    slug: "nextjs",
    icon: Code2,
    title: "Next.js Development",
    description:
      "Fast, SEO-friendly web applications built with React and Next.js.",
    seoTitle: "Next.js Development Company India",
    seoDescription:
      "Hire a Next.js development company in India for App Router sites, headless Shopify, SaaS dashboards, and Core Web Vitals–focused builds from Techlyser.",
    keywords: [
      "Next.js development company India",
      "Headless commerce India",
      "Next.js agency India",
      "React developers India",
    ],
    href: "/services/nextjs",
    coverImage: unsplash("photo-1461749280684-dccba630e2f6"),
    coverAlt: "Developer working on modern web application code",
    heroHeadline: "Next.js apps that feel fast, rank well, and scale cleanly",
    intro:
      "We build modern React applications with the App Router, server components, and performance patterns that keep your product snappy from day one.",
    overview: [
      "Next.js is our go-to stack for marketing sites, customer portals, SaaS dashboards, and headless commerce experiences that need SEO, speed, and a polished UI.",
      "Our builds use TypeScript, thoughtful data fetching, accessible components, and deployment pipelines that make releases predictable — whether you ship on Vercel or your own infrastructure.",
    ],
    benefits: [
      {
        title: "SEO-ready by default",
        description:
          "Server rendering, metadata, sitemaps, and structured content that search engines understand.",
      },
      {
        title: "Production-grade React",
        description:
          "TypeScript, clean component architecture, and patterns that stay maintainable as teams grow.",
      },
      {
        title: "Headless commerce",
        description:
          "Shopify, Stripe, and CMS integrations for flexible storefronts and content-driven sites.",
      },
      {
        title: "Performance culture",
        description:
          "Route-level caching, image optimization, and Core Web Vitals treated as product requirements.",
      },
    ],
    deliverables: [
      "Next.js App Router application or site",
      "Design system / UI component library",
      "CMS, auth, or API integrations",
      "Analytics and SEO foundations",
      "CI/CD and environment setup",
      "Documentation for your engineering team",
    ],
    process: [
      {
        step: "01",
        title: "Product & tech alignment",
        description:
          "Clarify users, routes, data sources, and non-functional requirements before writing code.",
      },
      {
        step: "02",
        title: "Architecture & UX",
        description:
          "Information architecture, component plan, and high-fidelity screens for key flows.",
      },
      {
        step: "03",
        title: "Iterative development",
        description:
          "Feature slices shipped behind previews so stakeholders can review real progress weekly.",
      },
      {
        step: "04",
        title: "Hardening & handoff",
        description:
          "Testing, performance budget checks, docs, and a smooth production launch.",
      },
    ],
    gallery: [
      {
        src: unsplash("photo-1498050108023-c5249f4df085", 900, 700),
        alt: "Laptop with code for a Next.js project",
      },
      {
        src: unsplash("photo-1516321318423-f06f85e504b3", 900, 700),
        alt: "Team collaborating on a digital product",
      },
      {
        src: unsplash("photo-1555066931-4365d14bab8c", 900, 700),
        alt: "Clean code editor on a dark theme display",
      },
      {
        src: unsplash("photo-1551650975-87deedd944c3", 900, 700),
        alt: "Mobile and desktop web app interfaces",
      },
    ],
  },
  {
    id: 3,
    slug: "wordpress",
    icon: Globe,
    title: "WordPress Development",
    description:
      "Custom WordPress websites with modern design and easy content management.",
    seoTitle: "WordPress Development India",
    seoDescription:
      "WordPress and WooCommerce development in India — custom themes, performance, security, and migrations from Techlyser.",
    keywords: [
      "WordPress development India",
      "WooCommerce development India",
      "WordPress agency India",
    ],
    href: "/services/wordpress",
    coverImage: unsplash("photo-1432888498266-38ffec3eaf0a"),
    coverAlt: "Content-rich website design on a workspace desk",
    heroHeadline: "WordPress sites that are easy to edit and hard to outgrow",
    intro:
      "We build custom WordPress experiences — from marketing sites to content hubs — with modern design, secure foundations, and editors your team will actually enjoy using.",
    overview: [
      "WordPress remains one of the best platforms for content-led businesses. We go beyond page builders and deliver tailored themes, Gutenberg blocks, and performance setups that feel contemporary.",
      "Security, hosting hygiene, and plugin discipline matter as much as design. We keep your stack lean so updates stay safe and page speed stays competitive.",
    ],
    benefits: [
      {
        title: "Editor-friendly CMS",
        description:
          "Custom blocks and clear content models so marketing can publish without breaking layouts.",
      },
      {
        title: "Modern visual design",
        description:
          "Brand-forward UI that looks nothing like a generic template — on every device.",
      },
      {
        title: "Lean, secure stack",
        description:
          "Careful plugin choices, hardening, and backups that reduce risk without slowing you down.",
      },
      {
        title: "SEO & performance",
        description:
          "Clean markup, caching strategy, and Core Web Vitals improvements for organic growth.",
      },
    ],
    deliverables: [
      "Custom WordPress theme or block theme",
      "Gutenberg / ACF content structure",
      "Blog, landing pages, and forms",
      "Performance and security baseline",
      "Migration from legacy WordPress or other CMS",
      "Editor training and documentation",
    ],
    process: [
      {
        step: "01",
        title: "Content & goals workshop",
        description:
          "Define pages, taxonomies, and who will manage content day to day.",
      },
      {
        step: "02",
        title: "Design system",
        description:
          "Typography, components, and templates that scale across campaigns and blog posts.",
      },
      {
        step: "03",
        title: "Theme & CMS build",
        description:
          "Custom development, integrations, and staging environments for review.",
      },
      {
        step: "04",
        title: "Launch & care",
        description:
          "Go-live checklist, redirects, monitoring, and optional retainer support.",
      },
    ],
    gallery: [
      {
        src: unsplash("photo-1486312338219-ce68d2c6f44d", 900, 700),
        alt: "Person managing website content on a laptop",
      },
      {
        src: unsplash("photo-1542744173-8e2bd1f53ce2", 900, 700),
        alt: "Marketing team reviewing website layouts",
      },
      {
        src: unsplash("photo-1507238691740-187a5b1d37b8", 900, 700),
        alt: "Responsive website design mockups",
      },
      {
        src: unsplash("photo-1454165804606-c3d57bc86b40", 900, 700),
        alt: "Business planning around a digital presence",
      },
    ],
  },
  {
    id: 4,
    slug: "ui-ux",
    icon: Palette,
    title: "UI / UX Design",
    description:
      "Beautiful user interfaces focused on conversion and usability.",
    seoTitle: "UI UX Design Agency India",
    seoDescription:
      "Conversion-focused UI/UX design for Shopify and web products. Techlyser designs interfaces that look refined and drive action.",
    keywords: [
      "UI UX design agency India",
      "ecommerce UX design",
      "Shopify UI design",
    ],
    href: "/services/ui-ux",
    coverImage: unsplash("photo-1561070791-2526d30994b5"),
    coverAlt: "UI design system and interface components on screen",
    heroHeadline: "Interfaces that look refined and guide users to action",
    intro:
      "We design digital products and marketing experiences where every screen has a job — clarity, trust, and conversion — without sacrificing brand personality.",
    overview: [
      "Great UI/UX is not decoration. We research user journeys, simplify friction, and craft visual systems that developers can implement consistently across web and ecommerce.",
      "From wireframes to high-fidelity prototypes, our design process keeps stakeholders aligned early and reduces costly rework during development.",
    ],
    benefits: [
      {
        title: "Conversion-minded UX",
        description:
          "Flows mapped to business goals — signups, purchases, demos — with fewer dead ends.",
      },
      {
        title: "Brand-led visual systems",
        description:
          "Typography, color, and components that feel premium and stay consistent at scale.",
      },
      {
        title: "Mobile-first craft",
        description:
          "Touch-friendly layouts and responsive patterns that hold up in real-world use.",
      },
      {
        title: "Dev-ready handoff",
        description:
          "Specs, tokens, and prototypes that engineering can ship without guesswork.",
      },
    ],
    deliverables: [
      "UX research summary and user flows",
      "Wireframes for key journeys",
      "High-fidelity UI designs (Figma)",
      "Design system / component library",
      "Interactive prototypes for stakeholder review",
      "Design QA during development",
    ],
    process: [
      {
        step: "01",
        title: "Discover",
        description:
          "Interviews, analytics review, and competitive landscape to frame the problem.",
      },
      {
        step: "02",
        title: "Structure",
        description:
          "Information architecture and wireframes that prioritize clarity over decoration.",
      },
      {
        step: "03",
        title: "Design",
        description:
          "Visual design, microcopy, and interactive prototypes ready for feedback.",
      },
      {
        step: "04",
        title: "Support build",
        description:
          "Handoff, design tokens, and QA so the live product matches the intent.",
      },
    ],
    gallery: [
      {
        src: unsplash("photo-1581291518857-4e27b48ff24e", 900, 700),
        alt: "Designer crafting interface layouts",
      },
      {
        src: unsplash("photo-1611162616475-46b635cb6868", 900, 700),
        alt: "Color palette and brand design tools",
      },
      {
        src: unsplash("photo-1559028012-481c04fa702d", 900, 700),
        alt: "Wireframes and sticky notes for UX planning",
      },
      {
        src: unsplash("photo-1586717791821-3f44a563fa4c", 900, 700),
        alt: "User experience sketching on paper and tablet",
      },
    ],
  },
  {
    id: 5,
    slug: "performance",
    icon: Gauge,
    title: "Performance Optimization",
    description: "Improve Core Web Vitals, loading speed, and user experience.",
    seoTitle: "Core Web Vitals & Performance Optimization India",
    seoDescription:
      "Fix LCP, CLS, and INP on Shopify and Next.js sites. Techlyser improves Core Web Vitals, speed, and conversion for Indian ecommerce brands.",
    keywords: [
      "Core Web Vitals optimization",
      "Shopify speed optimization India",
      "website performance agency",
    ],
    href: "/services/performance",
    coverImage: unsplash("photo-1551288049-bebda4e38f71"),
    coverAlt: "Performance analytics dashboard on a monitor",
    heroHeadline: "Make every page feel instant — and measure the lift",
    intro:
      "Slow sites lose sales and rankings. We audit, fix, and harden performance across Shopify, Next.js, and WordPress so Core Web Vitals stop being a bottleneck.",
    overview: [
      "We dig into real user metrics, Lighthouse profiles, and network waterfalls to find what actually hurts — then ship targeted fixes instead of generic “optimization” checklists.",
      "Expect improvements in LCP, INP, and CLS, plus clearer ownership of images, scripts, fonts, and third-party tags so gains last after launch.",
    ],
    benefits: [
      {
        title: "Core Web Vitals focus",
        description:
          "Practical fixes for LCP, INP, and CLS that move Search Console and conversion metrics.",
      },
      {
        title: "Platform-specific expertise",
        description:
          "Shopify theme budgets, Next.js caching, and WordPress caching/CDN strategies done right.",
      },
      {
        title: "Third-party discipline",
        description:
          "Script loading strategies that keep analytics and chat widgets from wrecking UX.",
      },
      {
        title: "Sustainable wins",
        description:
          "Guidelines and budgets so future features do not undo your performance gains.",
      },
    ],
    deliverables: [
      "Full performance audit report",
      "Prioritized fix roadmap",
      "Implementation of critical optimizations",
      "Before/after Core Web Vitals comparison",
      "Image, font, and caching strategy",
      "Monitoring recommendations",
    ],
    process: [
      {
        step: "01",
        title: "Measure",
        description:
          "Lab + field data, key templates, and competitive speed baselines.",
      },
      {
        step: "02",
        title: "Diagnose",
        description:
          "Isolate render blockers, oversized assets, and main-thread work.",
      },
      {
        step: "03",
        title: "Optimize",
        description:
          "Ship high-impact fixes in controlled releases with clear diffs.",
      },
      {
        step: "04",
        title: "Verify",
        description:
          "Re-test vitals, document changes, and set ongoing budgets.",
      },
    ],
    gallery: [
      {
        src: unsplash("photo-1460925895917-afdab827c52f", 900, 700),
        alt: "Speed and analytics charts on a laptop",
      },
      {
        src: unsplash("photo-1518186285589-2f7649de83e0", 900, 700),
        alt: "Server and infrastructure performance concept",
      },
      {
        src: unsplash("photo-1504868584819-f8e8b4b6d7e3", 900, 700),
        alt: "Data visualization for website metrics",
      },
      {
        src: unsplash("photo-1633356122544-f134324a6cee", 900, 700),
        alt: "Modern web technology and optimization workspace",
      },
    ],
  },
  {
    id: 6,
    slug: "seo",
    icon: TrendingUp,
    title: "SEO & Growth",
    description:
      "Technical SEO and performance strategies to increase visibility.",
    seoTitle: "Ecommerce SEO Agency India",
    seoDescription:
      "Technical SEO, content strategy, and ecommerce growth for Shopify brands in India. Schema, CWV, and search visibility from Techlyser.",
    keywords: [
      "ecommerce SEO India",
      "Shopify SEO agency",
      "AI search optimization",
      "technical SEO India",
    ],
    href: "/services/seo",
    coverImage: unsplash("photo-1553877522-43269d4ea984"),
    coverAlt: "SEO strategy planning with analytics and search insights",
    heroHeadline: "Technical SEO and growth systems that compound over time",
    intro:
      "We connect crawlability, content architecture, and on-page excellence so your site can earn visibility — then keep improving with measurable growth loops.",
    overview: [
      "SEO is more than keywords. We fix the technical foundation, structure pages for intent, and align content with how your buyers actually search.",
      "Whether you run Shopify, Next.js, or WordPress, we implement schema, internal linking, and performance habits that support sustainable organic growth.",
    ],
    benefits: [
      {
        title: "Technical SEO foundations",
        description:
          "Indexation, canonicals, sitemaps, redirects, and structured data done correctly.",
      },
      {
        title: "Architecture for intent",
        description:
          "URL and content models that match how customers search and how you sell.",
      },
      {
        title: "On-page that converts",
        description:
          "Titles, headings, and page layouts that satisfy searchers and move them toward action.",
      },
      {
        title: "Measurement & iteration",
        description:
          "Clear KPIs, Search Console hygiene, and a backlog that prioritizes impact.",
      },
    ],
    deliverables: [
      "Technical SEO audit",
      "Keyword and topic map for priority pages",
      "On-page recommendations and implementation support",
      "Schema / structured data setup",
      "Internal linking and content hub plan",
      "Monthly growth reporting (optional retainer)",
    ],
    process: [
      {
        step: "01",
        title: "Audit",
        description:
          "Crawl your site, competitors, and analytics to find the biggest unlocks.",
      },
      {
        step: "02",
        title: "Strategy",
        description:
          "Prioritize technical fixes, content opportunities, and quick wins.",
      },
      {
        step: "03",
        title: "Implement",
        description:
          "Ship changes with developers and content owners in a coordinated sprint.",
      },
      {
        step: "04",
        title: "Grow",
        description:
          "Track rankings and conversions, then iterate on what moves the needle.",
      },
    ],
    gallery: [
      {
        src: unsplash("photo-1562577309-4932fdd978ae", 900, 700),
        alt: "Search marketing and growth analytics",
      },
      {
        src: unsplash("photo-1553877522-43269d4ea984", 900, 700),
        alt: "Team reviewing growth strategy in a meeting",
      },
      {
        src: unsplash("photo-1533750349088-cd871a92f312", 900, 700),
        alt: "Digital marketing charts and planning notes",
      },
      {
        src: unsplash("photo-1611224923853-80b023f02d71", 900, 700),
        alt: "Keyword research and content planning workspace",
      },
    ],
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export function getAllServiceSlugs(): string[] {
  return services.map((service) => service.slug);
}
