import type { AiRecommendation, TechnicalAuditResult } from "@/website-audit/types";
import { CATEGORY_LABELS } from "@/website-audit/types";

export function buildReportHtml(input: {
  websiteUrl: string;
  businessName?: string | null;
  result: TechnicalAuditResult;
  recommendations: AiRecommendation[];
}) {
  const date = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const score =
    input.result.overallScore == null ? "Insufficient data" : `${input.result.overallScore}/100`;
  const categories = input.result.categoryScores
    .map(
      (c) =>
        `<tr><td>${c.label}</td><td>${c.score == null ? "N/A" : `${c.score}/100`}</td><td>${c.summary}</td></tr>`,
    )
    .join("");
  const recs = input.recommendations
    .map(
      (r, i) => `
      <div class="card">
        <h3>${i + 1}. ${escapeHtml(r.problemTitle)}</h3>
        <p><strong>Category:</strong> ${escapeHtml(String(CATEGORY_LABELS[r.category as keyof typeof CATEGORY_LABELS] || r.category))} · <strong>Priority:</strong> ${escapeHtml(r.priority)} · <strong>Confidence:</strong> ${escapeHtml(r.confidence)}</p>
        <p><strong>Observed:</strong> ${escapeHtml(r.observation)}</p>
        <p><strong>Why it matters:</strong> ${escapeHtml(r.whyItMatters)}</p>
        <p><strong>Recommendation:</strong> ${escapeHtml(r.recommendation)}</p>
        <p><strong>Expected benefit:</strong> ${escapeHtml(r.expectedBenefit)}</p>
      </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Website Growth Audit — Techlyser</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;color:#111;line-height:1.5;margin:0;padding:32px;background:#fff}
  h1,h2,h3{color:#0f172a} .brand{color:#ff5400}
  .muted{color:#64748b} .card{border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:12px 0}
  table{width:100%;border-collapse:collapse} td,th{border:1px solid #e2e8f0;padding:8px;text-align:left}
  .footer{margin-top:40px;font-size:12px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:12px}
</style></head><body>
  <p class="brand"><strong>TECHLYSER</strong> · Website Growth Audit</p>
  <h1>Is your website helping your business grow?</h1>
  <p class="muted">Audited URL: ${escapeHtml(input.websiteUrl)}<br/>${input.businessName ? `Business: ${escapeHtml(input.businessName)}<br/>` : ""}Report date: ${date}</p>
  <div class="card"><h2>Overall score</h2><p style="font-size:28px;margin:0">${score}</p>
  <p class="muted">Checks performed: ${input.result.checksPerformed} · Unavailable: ${input.result.checksUnavailable}</p></div>
  <h2>Category scores</h2>
  <table><thead><tr><th>Category</th><th>Score</th><th>Summary</th></tr></thead><tbody>${categories}</tbody></table>
  <h2>Executive summary</h2>
  <p>This audit combines verified technical checks with practical growth recommendations. Scores are evidence-based. Unavailable measurements are marked and never invented.</p>
  ${input.result.limitations.length ? `<div class="card"><strong>Limitations</strong><ul>${input.result.limitations.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul></div>` : ""}
  <h2>Prioritized recommendations</h2>
  ${recs || "<p>No prioritized recommendations were generated.</p>"}
  <h2>Action plan</h2>
  <div class="card"><strong>Quick wins</strong><p>Fix missing titles/meta, viewport, HTTPS issues, and CTA clarity first.</p></div>
  <div class="card"><strong>Short-term</strong><p>Improve navigation, forms, trust proof, and heading structure.</p></div>
  <div class="card"><strong>Long-term</strong><p>Performance program, content strategy, and conversion journey redesign where needed.</p></div>
  <h2>Next step with Techlyser</h2>
  <p>Your website is an important part of your business growth. Let’s turn these opportunities into improvements.</p>
  <p><strong>Discuss your website improvement plan:</strong> <a href="https://techlyser.com/contact">techlyser.com/contact</a></p>
  <div class="footer">© ${new Date().getFullYear()} Techlyser. All Rights Reserved. · Website Growth Audit by Techlyser · Generated ${date}</div>
</body></html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Lightweight text PDF (no browser). HTML remains the rich report; PDF is a portable summary. */
export function buildReportPdfBase64(input: {
  websiteUrl: string;
  businessName?: string | null;
  result: TechnicalAuditResult;
  recommendations: AiRecommendation[];
}) {
  const lines = [
    "TECHLYSER — Website Growth Audit",
    `URL: ${input.websiteUrl}`,
    input.businessName ? `Business: ${input.businessName}` : "",
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    `Overall score: ${input.result.overallScore ?? "Insufficient data"}`,
    "",
    "Category scores:",
    ...input.result.categoryScores.map(
      (c) => `- ${c.label}: ${c.score ?? "N/A"} (${c.summary})`,
    ),
    "",
    "Top recommendations:",
    ...input.recommendations.slice(0, 8).flatMap((r, i) => [
      `${i + 1}. [${r.priority}] ${r.problemTitle}`,
      `   ${r.recommendation}`,
      "",
    ]),
    "Discuss improvements: https://techlyser.com/contact",
    `© ${new Date().getFullYear()} Techlyser. All Rights Reserved.`,
  ].filter(Boolean);

  // Minimal valid single-page PDF
  const text = lines.join("\n");
  const escaped = text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .split("\n")
    .map((line, index) => `BT /F1 10 Tf 40 ${780 - index * 14} Td (${line.slice(0, 100)}) Tj ET`)
    .join("\n");

  const content = `q\n${escaped}\nQ`;
  const objects = [
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj",
    "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj",
    `4 0 obj<< /Length ${Buffer.byteLength(content)} >>stream\n${content}\nendstream endobj`,
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${obj}\n`;
  }
  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf).toString("base64");
}
