import assert from "node:assert/strict";
import test from "node:test";
import { leadsToCsv } from "./csv";
import { normalizeDomain } from "./domain";
import { isLeadMarket } from "./markets";
import { buildOutreachDrafts } from "./outreach";
import { qualifyFromFacts, stripInventedEmail } from "./qualify";
import { detectShopify } from "./shopify";
import { extractPublicEmail, extractSocialProfiles } from "./social";
import { isBlockedIp } from "./ssrf";

test("target markets stay limited to Techlyser regions", () => {
  assert.equal(isLeadMarket("US"), true);
  assert.equal(isLeadMarket("AU"), true);
  assert.equal(isLeadMarket("IN"), false);
});

test("domains normalize and ignore social hosts", () => {
  assert.equal(normalizeDomain("https://www.Example.com/pages/about"), "example.com");
  assert.equal(normalizeDomain("https://instagram.com/brand"), null);
});

test("private addresses are blocked", () => {
  assert.equal(isBlockedIp("127.0.0.1"), true);
  assert.equal(isBlockedIp("169.254.169.254"), true);
  assert.equal(isBlockedIp("8.8.8.8"), false);
});

test("shopify detection requires a public signal", () => {
  const hit = detectShopify('<script src="https://cdn.shopify.com/shopifycloud/theme.js"></script>');
  assert.equal(hit.shopifyDetected, true);
  assert.equal(hit.confidence, "high");
  const miss = detectShopify("<html><title>Cafe</title></html>");
  assert.equal(miss.shopifyDetected, false);
  assert.equal(miss.confidence, "none");
});

test("only profile links published on the site are verified", () => {
  const html = `
    <a href="https://www.instagram.com/brandstore/">Instagram</a>
    <a href="https://www.linkedin.com/company/brand-store">LinkedIn</a>
    <a href="https://facebook.com/sharer/sharer.php?u=1">Share</a>
  `;
  const profiles = extractSocialProfiles(html);
  assert.deepEqual(profiles.map((profile) => profile.platform).sort(), ["INSTAGRAM", "LINKEDIN"]);
  assert.equal(profiles.every((profile) => profile.verification === "VERIFIED"), true);
});

test("qualification does not invent an email", () => {
  const result = qualifyFromFacts(
    {
      name: "North Example",
      domain: "north.example",
      niche: "fashion",
      targetCountry: "US",
      countryCode: null,
      shopify: detectShopify("cdn.shopify.com"),
      profiles: [],
      publicEmail: null,
      ecommerceSignals: ["add to cart"],
      appScriptCount: 0,
    },
    50,
  );
  assert.equal(result.observedFacts.some((fact) => fact.includes("@")), false);
  assert.equal(stripInventedEmail("Email me at secret@brand.com", null).includes("secret@"), false);
});

test("csv export quotes fields and keeps one row per lead", () => {
  const csv = leadsToCsv([
    {
      name: 'Brand "North"',
      website: "https://north.example",
      domain: "north.example",
      targetCountry: "US",
      countryCode: null,
      shopifyConfidence: "high",
      publicEmail: "hello@north.example",
      score: 70,
      status: "QUALIFIED",
      source: "manual",
      profiles: [{ platform: "INSTAGRAM", url: "https://instagram.com/north", verification: "VERIFIED" }],
    },
  ]);
  assert.match(csv, /Brand ""North""/);
  assert.equal(csv.trim().split("\n").length, 2);
});

test("outreach drafts stay factual and unsent", () => {
  const drafts = buildOutreachDrafts({
    name: "North",
    website: "https://north.example",
    publicEmail: null,
    qualification: {
      observedFacts: ["Shopify high confidence: cdn.shopify.com asset"],
      hypotheses: [],
      recommendedServices: ["Shopify theme customization"],
    },
  });
  assert.equal(drafts.length, 3);
  assert.match(drafts[0].body, /cdn\.shopify\.com/);
  assert.equal(drafts.some((draft) => /\$[0-9]|employees|monthly traffic/i.test(draft.body)), false);
});

test("public email extraction skips platform inboxes", () => {
  assert.equal(extractPublicEmail("mailto:hello@brand.com"), "hello@brand.com");
  assert.equal(extractPublicEmail("support@shopify.com"), null);
});
