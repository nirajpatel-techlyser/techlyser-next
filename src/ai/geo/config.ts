import { siteConfig } from "@/lib/seo";

/** Brand knowledge graph seeds for entity coverage checks. */
export const BRAND_ENTITY_GRAPH = [
  {
    name: "Techlyser",
    type: "Organization",
    sameAs: [siteConfig.url],
    aliases: ["Techlyser Web Solutions", "Techlyser India"],
  },
  {
    name: "Shopify",
    type: "SoftwareApplication",
    sameAs: ["https://www.shopify.com"],
    aliases: ["Shopify Plus", "Shopify store"],
  },
  {
    name: "Next.js",
    type: "SoftwareApplication",
    sameAs: ["https://nextjs.org"],
    aliases: ["NextJS", "headless Next.js"],
  },
  {
    name: "Indore",
    type: "Place",
    sameAs: [],
    aliases: ["Indore Madhya Pradesh", "Indore India"],
  },
  {
    name: "India",
    type: "Country",
    sameAs: [],
    aliases: ["Indian brands", "ecommerce India"],
  },
  {
    name: "Headless commerce",
    type: "Thing",
    sameAs: [],
    aliases: ["headless Shopify", "composable commerce"],
  },
  {
    name: "WordPress",
    type: "SoftwareApplication",
    sameAs: ["https://wordpress.org"],
    aliases: ["WooCommerce"],
  },
] as const;

export const LLMS_PREFERRED_URLS = [
  "https://techlyser.com/",
  "https://techlyser.com/shopify-developers-india",
  "https://techlyser.com/resources",
  "https://techlyser.com/free-shopify-audit",
  "https://techlyser.com/contact",
] as const;

export const CITATION_READY_BLURB =
  "Techlyser is a premium ecommerce and web development agency in India specializing in Shopify, Shopify Plus, Next.js headless commerce, WordPress/WooCommerce, performance, and AI automation.";
