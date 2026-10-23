import type { ShopifyDetection } from "@/leads/shopify";
import type { ExtractedProfile } from "@/leads/social";
import { countryMatchesMarket } from "@/leads/markets";

export type LeadFacts = {
  name: string;
  domain: string;
  niche: string;
  targetCountry: string;
  countryCode: string | null;
  shopify: ShopifyDetection;
  profiles: ExtractedProfile[];
  publicEmail: string | null;
  ecommerceSignals: string[];
  appScriptCount: number;
};

export type Qualification = {
  score: number;
  explanation: string;
  observedFacts: string[];
  hypotheses: string[];
  recommendedServices: string[];
  status: "NEEDS_REVIEW" | "QUALIFIED" | "DISQUALIFIED";
};

const SERVICES = [
  "Shopify theme customization",
  "Shopify speed optimization",
  "Shopify migration",
  "E-commerce SEO",
  "Next.js and headless commerce",
] as const;

export function qualifyFromFacts(facts: LeadFacts, minScore: number): Qualification {
  const observed: string[] = [];
  let score = 0;

  if (facts.shopify.shopifyDetected) {
    observed.push(`Shopify ${facts.shopify.confidence} confidence: ${facts.shopify.evidence.join(", ")}`);
    score += facts.shopify.confidence === "high" ? 40 : facts.shopify.confidence === "medium" ? 25 : 10;
  } else {
    observed.push("No Shopify storefront signal on the fetched page");
  }

  if (facts.ecommerceSignals.length > 0) {
    observed.push(`Ecommerce signals: ${facts.ecommerceSignals.join(", ")}`);
    score += 15;
  }

  const verified = facts.profiles.filter((profile) => profile.verification === "VERIFIED");
  if (verified.length > 0) {
    observed.push(`Social links on the website: ${verified.map((profile) => profile.platform).join(", ")}`);
    score += Math.min(15, verified.length * 5);
  } else {
    observed.push("No official social profile link found on the website");
  }

  if (facts.publicEmail) {
    observed.push(`Public email on the page: ${facts.publicEmail}`);
    score += 10;
  }

  if (facts.countryCode && countryMatchesMarket(facts.countryCode, facts.targetCountry)) {
    observed.push(`Page mentions target market country ${facts.countryCode}`);
    score += 10;
  }

  if (facts.niche && facts.name.toLowerCase().includes(facts.niche.toLowerCase())) {
    observed.push(`Business title mentions the niche "${facts.niche}"`);
    score += 10;
  }

  score = Math.max(0, Math.min(100, score));

  const hypotheses: string[] = [];
  if (facts.shopify.shopifyDetected && facts.appScriptCount >= 8) {
    hypotheses.push("Several third-party Shopify scripts are present. Speed impact is a hypothesis, not a measured result.");
  }

  const recommended: string[] = [];
  if (facts.shopify.shopifyDetected) recommended.push("Shopify theme customization");
  if (facts.appScriptCount >= 8) recommended.push("Shopify speed optimization");
  if (facts.ecommerceSignals.length > 0) recommended.push("E-commerce SEO");
  if (recommended.length === 0) recommended.push("Shopify store development");

  let status: Qualification["status"] = "NEEDS_REVIEW";
  if (!facts.shopify.shopifyDetected && facts.ecommerceSignals.length === 0) status = "DISQUALIFIED";
  else if (score >= minScore && facts.shopify.confidence === "high") status = "QUALIFIED";

  const explanation = [
    `Score ${score}/100 from observed page evidence only.`,
    ...observed.map((fact) => `Observed: ${fact}.`),
    ...hypotheses.map((item) => `Hypothesis: ${item}`),
    `Suggested services are based on those signals: ${recommended.filter((item) => (SERVICES as readonly string[]).includes(item) || item === "Shopify store development").join(", ")}.`,
  ].join(" ");

  return { score, explanation, observedFacts: observed, hypotheses, recommendedServices: recommended, status };
}

export function stripInventedEmail(text: string, allowed: string | null) {
  return text.replace(/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/gi, (email) => {
    if (allowed && email.toLowerCase() === allowed.toLowerCase()) return email;
    return "[removed unobserved email]";
  });
}

export function ecommerceSignals(html: string) {
  const signals: string[] = [];
  if (/add to cart|add-to-cart/i.test(html)) signals.push("add to cart");
  if (/\/products\//i.test(html)) signals.push("product URLs");
  if (/og:type"\s+content="product"/i.test(html)) signals.push("product metadata");
  return signals;
}

export function countAppScripts(html: string) {
  const matches = html.match(/cdn\.shopify\.com\/extensions\//gi);
  return matches?.length || 0;
}
