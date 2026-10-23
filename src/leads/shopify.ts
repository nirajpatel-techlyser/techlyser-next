export type ShopifyConfidence = "high" | "medium" | "low" | "none";

export type ShopifyDetection = {
  shopifyDetected: boolean;
  confidence: ShopifyConfidence;
  evidence: string[];
  checkedAt: string;
};

const HIGH = [
  { re: /cdn\.shopify\.com/i, label: "cdn.shopify.com asset" },
  { re: /myshopify\.com/i, label: "myshopify.com reference" },
  { re: /Shopify\.shop\s*=/i, label: "Shopify.shop storefront object" },
  { re: /cdn\/shop\//i, label: "Shopify cdn/shop path" },
];

const MEDIUM = [
  { re: /shopify-section/i, label: "shopify-section markup" },
  { re: /\/cart\.js\b/i, label: "Shopify cart.js" },
];

export function detectShopify(html: string): ShopifyDetection {
  const evidence: string[] = [];
  for (const signal of HIGH) {
    if (signal.re.test(html)) evidence.push(signal.label);
  }
  if (evidence.length > 0) {
    return {
      shopifyDetected: true,
      confidence: "high",
      evidence,
      checkedAt: new Date().toISOString(),
    };
  }
  for (const signal of MEDIUM) {
    if (signal.re.test(html)) evidence.push(signal.label);
  }
  if (evidence.length > 0) {
    return {
      shopifyDetected: true,
      confidence: "medium",
      evidence,
      checkedAt: new Date().toISOString(),
    };
  }
  if (/powered by shopify/i.test(html)) {
    return {
      shopifyDetected: true,
      confidence: "low",
      evidence: ["Visible text says Powered by Shopify"],
      checkedAt: new Date().toISOString(),
    };
  }
  return {
    shopifyDetected: false,
    confidence: "none",
    evidence: ["No public Shopify storefront signal on the fetched page"],
    checkedAt: new Date().toISOString(),
  };
}
