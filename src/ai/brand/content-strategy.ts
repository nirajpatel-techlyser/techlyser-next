/**
 * Techlyser editorial strategy for topic seeding and writer guidance.
 * Business outcomes first — never "what is X technology" explainers.
 */

export const TECHLYSER_STACK = [
  "Shopify",
  "WordPress",
  "PHP",
  "Next.js",
  "AngularJS",
  "React.js",
] as const;

/** Soft editorial mix — not a rigid daily quota. */
export const CONTENT_MIX = {
  shopifyEcommerce: 0.25,
  wordpressVisibility: 0.15,
  nextjsPerformance: 0.15,
  reactExperience: 0.1,
  phpAutomation: 0.1,
  angularModernization: 0.05,
  crossTechGrowth: 0.2,
} as const;

export const CONTENT_OBJECTIVES = [
  "attract more potential customers",
  "improve online visibility",
  "convert visitors into leads or buyers",
  "improve customer engagement",
  "build customer trust",
  "improve website performance",
  "increase customer retention",
  "reduce repetitive manual work",
  "build scalable digital systems",
  "improve overall digital business strategy",
] as const;

export const TECHLYSER_CONTENT_PHILOSOPHY =
  "When our clients' businesses grow, Techlyser grows with them.";
