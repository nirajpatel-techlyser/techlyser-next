import assert from "node:assert/strict";
import test from "node:test";
import { getMetaContent, getTitle, stripTags } from "./html";
import { scoreCategories } from "./score";
import type { AuditFinding } from "./types";

test("stripTags removes script and markup", () => {
  const text = stripTags("<script>alert(1)</script><h1>Hello <em>world</em></h1>");
  assert.equal(text, "Hello world");
});

test("title and meta helpers read public HTML signals", () => {
  const html = `
    <html><head>
      <title>Acme Store</title>
      <meta name="description" content="Widgets for teams" />
      <meta property="og:title" content="Acme OG" />
    </head></html>
  `;
  assert.equal(getTitle(html), "Acme Store");
  assert.equal(getMetaContent(html, "description"), "Widgets for teams");
  assert.equal(getMetaContent(html, "og:title"), "Acme OG");
});

test("scoring never invents a score without available checks", () => {
  const unavailable: AuditFinding[] = [
    {
      id: "perf-1",
      category: "performance",
      title: "PSI missing",
      observation: "No key",
      whyItMatters: "Need measured data",
      recommendation: "Add key",
      severity: "info",
      confidence: "not_tested",
      scoreImpact: 5,
      passed: false,
      available: false,
    },
  ];
  const empty = scoreCategories(unavailable);
  assert.equal(empty.overallScore, null);
  assert.equal(empty.categoryScores.find((c) => c.id === "performance")?.score, null);
});

test("scoring deducts only from available failed checks", () => {
  const findings: AuditFinding[] = [
    {
      id: "seo-title",
      category: "seo",
      title: "Title present",
      observation: "Found",
      whyItMatters: "Titles help discovery",
      recommendation: "Keep",
      severity: "low",
      confidence: "verified",
      scoreImpact: 10,
      passed: true,
      available: true,
    },
    {
      id: "seo-meta",
      category: "seo",
      title: "Meta missing",
      observation: "None",
      whyItMatters: "Snippets",
      recommendation: "Add meta",
      severity: "medium",
      confidence: "verified",
      scoreImpact: 10,
      passed: false,
      available: true,
    },
  ];
  const scored = scoreCategories(findings);
  const seo = scored.categoryScores.find((c) => c.id === "seo");
  assert.equal(seo?.score, 50);
  assert.equal(typeof scored.overallScore, "number");
  assert.ok((scored.overallScore as number) >= 0 && (scored.overallScore as number) <= 100);
});
