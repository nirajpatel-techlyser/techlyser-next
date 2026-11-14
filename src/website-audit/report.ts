import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { siteConfig } from "@/lib/seo";
import { pageKindLabel } from "@/website-audit/platform";
import {
  buildReportScreenshots,
  type ReportScreenshot,
} from "@/website-audit/screenshots";
import type { AiRecommendation, TechnicalAuditResult } from "@/website-audit/types";
import { CATEGORY_LABELS } from "@/website-audit/types";

const ORANGE = rgb(1, 0.329, 0);
const BLACK = rgb(0.043, 0.071, 0.125);
const MUTED = rgb(0.392, 0.455, 0.545);
const LINE = rgb(0.886, 0.91, 0.941);
const PAGE_W = 612;
const PAGE_H = 792;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function brandStripHtml() {
  return `<div class="brand-strip">
  <img src="${siteConfig.url}/images/TEXHLYSER_white_Logo.png" alt="Techlyser" />
  <div class="brand-meta">${escapeHtml(siteConfig.phoneDisplay)}<br/>
  <a href="${siteConfig.url}">techlyser.com</a> · ${escapeHtml(siteConfig.email)}</div>
</div><div class="accent"></div>`;
}

function footerStripHtml(extra = "") {
  return `<div class="footer-strip"><div><strong>Techlyser</strong> · Website Growth Audit${extra ? ` · ${escapeHtml(extra)}` : ""}</div>
  <div>${escapeHtml(siteConfig.phoneDisplay)} · techlyser.com</div></div>`;
}

export async function buildReportAssets(input: {
  websiteUrl: string;
  businessName?: string | null;
  result: TechnicalAuditResult;
  recommendations: AiRecommendation[];
}) {
  const pagesForShots = input.result.pages
    .filter((p) => p.status === "ok")
    .map((p) => ({
      url: p.url,
      label: pageKindLabel(p.kind || "other"),
    }));
  if (pagesForShots.length === 0) {
    pagesForShots.push({ url: input.websiteUrl, label: "Homepage" });
  }
  const screenshots = await buildReportScreenshots(pagesForShots);
  const reportHtml = buildReportHtml({ ...input, screenshots });
  const pdfBase64 = await buildReportPdfBase64({ ...input, screenshots });
  return { reportHtml, pdfBase64, screenshots };
}

export function buildReportHtml(input: {
  websiteUrl: string;
  businessName?: string | null;
  result: TechnicalAuditResult;
  recommendations: AiRecommendation[];
  screenshots?: ReportScreenshot[];
}) {
  const date = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const score =
    input.result.overallScore == null
      ? "Insufficient data"
      : `${input.result.overallScore}/100`;
  const platform = input.result.platform;
  const categories = input.result.categoryScores
    .map(
      (c) =>
        `<tr><td>${escapeHtml(c.label)}</td><td>${c.score == null ? "N/A" : `${c.score}/100`}</td><td>${escapeHtml(c.summary)}</td></tr>`,
    )
    .join("");

  const desktopShots = (input.screenshots || []).filter((s) => s.device === "desktop");
  const mobileShots = (input.screenshots || []).filter((s) => s.device === "mobile");

  const renderShot = (s: ReportScreenshot) => {
    const labelClass = s.kind === "actual" ? "actual" : "suggested";
    const labelText = s.kind === "actual" ? "Actual" : "Suggested";
    const media =
      s.kind === "actual" && s.imageUrl
        ? `<img src="${escapeHtml(s.imageUrl)}" alt="${escapeHtml(s.pageLabel)}" />`
        : `<div class="suggested-mock"><div class="mock-nav"></div><div class="mock-hero">Illustrative concept for ${escapeHtml(s.pageLabel)} — clearer hierarchy, stronger CTA, improved spacing.</div><div class="mock-row"><i></i><i></i><i></i></div></div>`;
    return `<div class="shot"><div class="shot-label ${labelClass}">${labelText} · ${escapeHtml(s.pageLabel)}</div><div class="shot-frame ${s.device}">${media}</div><div class="shot-caption">${escapeHtml(s.caption)}</div></div>`;
  };

  const recs = input.recommendations
    .slice(0, 8)
    .map(
      (r, i) => `
      <div class="finding">
        <h3>${i + 1}. ${escapeHtml(r.problemTitle)} <span class="pill">${escapeHtml(r.priority)}</span></h3>
        <p>${escapeHtml(r.recommendation)}</p>
        <p><strong>What we observed:</strong> ${escapeHtml(r.observation)}</p>
        <p><strong>Why it matters:</strong> ${escapeHtml(r.whyItMatters)}</p>
        <p><strong>Expected benefit:</strong> ${escapeHtml(r.expectedBenefit)}</p>
      </div>`,
    )
    .join("");

  const themeLine = platform?.themeHint
    ? `Beyond these points, additional improvements related to the <strong>${escapeHtml(platform.themeHint)}</strong> may further enhance design and functionality.`
    : platform?.platform && platform.platform !== "unknown"
      ? `Beyond these points, platform-specific improvements for <strong>${escapeHtml(platform.platform)}</strong> may further enhance the experience.`
      : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Website Growth Audit — Techlyser</title>
<style>
  body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.55;background:#fff}
  .page{max-width:820px;margin:0 auto 18px;border:1px solid #e2e8f0}
  .brand-strip{background:#0b1220;color:#fff;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:14px 24px}
  .brand-strip img{height:32px}
  .brand-meta{font-size:11px;color:#cbd5e1;text-align:right}
  .brand-meta a{color:#fff;text-decoration:none}
  .accent{height:4px;background:linear-gradient(90deg,#ff5400,#ff0000)}
  .content{padding:24px}
  .footer-strip{background:#0b1220;color:#94a3b8;font-size:11px;padding:12px 24px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .footer-strip strong{color:#fff}
  .eyebrow{color:#ff5400;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}
  h1{font-size:26px;margin:8px 0 10px} h2{font-size:17px;margin:20px 0 10px} h3{font-size:14px;margin:0 0 8px}
  .muted{color:#64748b;font-size:13px}
  .score{display:grid;grid-template-columns:120px 1fr;gap:14px;margin:14px 0}
  .score-box{border:1px solid #e2e8f0;border-radius:12px;padding:14px;text-align:center;background:#f8fafc}
  .score-box .num{font-size:34px;font-weight:800;color:#ff5400}
  .meta{border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;font-size:13px}
  table{width:100%;border-collapse:collapse;font-size:13px} td,th{border:1px solid #e2e8f0;padding:8px;text-align:left} th{background:#f8fafc}
  .device{display:inline-block;padding:6px 10px;border-radius:8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin:8px 0}
  .device.desktop{background:#eff6ff;color:#1d4ed8} .device.mobile{background:#f5f3ff;color:#6d28d9}
  .shots{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .shot{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}
  .shot-label{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:7px 10px}
  .shot-label.actual{background:#fee2e2;color:#991b1b} .shot-label.suggested{background:#ffedd5;color:#9a3412}
  .shot-frame{height:170px;background:#0f172a;overflow:hidden}
  .shot-frame img{width:100%;height:100%;object-fit:cover;object-position:top}
  .shot-caption{padding:8px 10px;font-size:11.5px;color:#64748b;border-top:1px solid #e2e8f0}
  .suggested-mock{height:100%;padding:12px;background:linear-gradient(180deg,#fff7ed,#fff);display:flex;flex-direction:column;gap:8px}
  .mock-nav{height:14px;border-radius:4px;background:#0b1220}
  .mock-hero{flex:1;border:1px dashed #fdba74;border-radius:8px;padding:8px;font-size:11px;color:#9a3412;background:#fff}
  .mock-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
  .mock-row i{display:block;height:28px;border-radius:6px;border:1px solid #fed7aa;background:#fff}
  .finding{border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin:0 0 12px}
  .pill{display:inline-block;font-size:10px;font-weight:700;background:#ffedd5;color:#9a3412;border-radius:99px;padding:2px 8px;margin-left:6px}
  .note{border-left:3px solid #ff5400;background:#fff7ed;padding:12px 14px;font-size:13px;margin:16px 0}
</style></head><body>
<div class="page">
  ${brandStripHtml()}
  <div class="content">
    <p class="eyebrow">Website Growth Audit</p>
    <h1>Is your website helping your business grow?</h1>
    <p class="muted">Audited URL: ${escapeHtml(input.websiteUrl)}${input.businessName ? ` · ${escapeHtml(input.businessName)}` : ""} · ${date}</p>
    <div class="score">
      <div class="score-box"><div class="num">${score === "Insufficient data" ? "—" : escapeHtml(String(input.result.overallScore))}</div><div class="muted">${score === "Insufficient data" ? score : "Overall / 100"}</div></div>
      <div class="meta">
        <div><strong>Checks performed:</strong> ${input.result.checksPerformed} · <strong>Unavailable:</strong> ${input.result.checksUnavailable} (not invented)</div>
        <div><strong>Platform:</strong> ${escapeHtml(platform?.platform || "unknown")}${platform?.themeHint ? ` · <strong>Theme signals:</strong> ${escapeHtml(platform.themeHint)}` : ""}</div>
        <div><strong>Pages reviewed:</strong> ${escapeHtml(input.result.pages.map((p) => pageKindLabel(p.kind || "other")).join(", ") || "Homepage")}</div>
      </div>
    </div>
    <h2>Category scores</h2>
    <table><thead><tr><th>Category</th><th>Score</th><th>Summary</th></tr></thead><tbody>${categories}</tbody></table>
  </div>
  ${footerStripHtml()}
</div>

<div class="page">
  ${brandStripHtml()}
  <div class="content">
    <div class="device desktop">Desktop experience</div>
    <h2>Actual vs suggested (desktop)</h2>
    <div class="shots">${desktopShots.map(renderShot).join("") || "<p class='muted'>Desktop screenshots unavailable for this run.</p>"}</div>
  </div>
  ${footerStripHtml("Desktop")}
</div>

<div class="page">
  ${brandStripHtml()}
  <div class="content">
    <div class="device mobile">Mobile experience</div>
    <h2>Actual vs suggested (mobile)</h2>
    <div class="shots">${mobileShots.map(renderShot).join("") || "<p class='muted'>Mobile screenshots unavailable for this run.</p>"}</div>
  </div>
  ${footerStripHtml("Mobile")}
</div>

<div class="page">
  ${brandStripHtml()}
  <div class="content">
    <h2>Prioritized recommendations</h2>
    ${recs || "<p>No prioritized recommendations were generated.</p>"}
    ${themeLine ? `<div class="note">${themeLine}</div>` : ""}
    <h2>Next step</h2>
    <p>I’d be happy to walk you through these recommendations and discuss how we can implement them for a more polished, conversion-focused experience.</p>
    <p><strong>Discuss your plan:</strong> <a href="${siteConfig.url}/contact">${siteConfig.url}/contact</a> · ${escapeHtml(siteConfig.phoneDisplay)}</p>
  </div>
  ${footerStripHtml(`© ${new Date().getFullYear()}`)}
</div>
</body></html>`;
}

function wrapText(text: string, maxChars: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  return lines;
}

async function paintHeader(
  pdf: PDFDocument,
  page: PDFPage,
  font: PDFFont,
  logoBytes: Uint8Array | null,
) {
  page.drawRectangle({ x: 0, y: PAGE_H - 48, width: PAGE_W, height: 48, color: BLACK });
  page.drawRectangle({ x: 0, y: PAGE_H - 52, width: PAGE_W, height: 4, color: ORANGE });
  if (logoBytes) {
    try {
      const img = await pdf.embedPng(logoBytes).catch(async () => pdf.embedJpg(logoBytes));
      page.drawImage(img, { x: 28, y: PAGE_H - 40, width: 110, height: 28 });
    } catch {
      page.drawText("TECHLYSER", {
        x: 28,
        y: PAGE_H - 30,
        size: 12,
        font,
        color: rgb(1, 1, 1),
      });
    }
  } else {
    page.drawText("TECHLYSER", {
      x: 28,
      y: PAGE_H - 30,
      size: 12,
      font,
      color: rgb(1, 1, 1),
    });
  }
  page.drawText(siteConfig.phoneDisplay, {
    x: PAGE_W - 200,
    y: PAGE_H - 22,
    size: 9,
    font,
    color: rgb(0.8, 0.84, 0.88),
  });
  page.drawText("techlyser.com", {
    x: PAGE_W - 200,
    y: PAGE_H - 36,
    size: 9,
    font,
    color: rgb(1, 1, 1),
  });
}

function paintFooter(page: PDFPage, font: PDFFont, note: string) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: 36, color: BLACK });
  page.drawText(note.slice(0, 70), {
    x: 28,
    y: 14,
    size: 8,
    font,
    color: rgb(0.7, 0.75, 0.8),
  });
  page.drawText(siteConfig.phoneDisplay, {
    x: PAGE_W - 180,
    y: 14,
    size: 8,
    font,
    color: rgb(0.7, 0.75, 0.8),
  });
}

export async function buildReportPdfBase64(input: {
  websiteUrl: string;
  businessName?: string | null;
  result: TechnicalAuditResult;
  recommendations: AiRecommendation[];
  screenshots?: ReportScreenshot[];
}) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let logoBytes: Uint8Array | null = null;
  try {
    const logoRes = await fetch(`${siteConfig.url}/images/TEXHLYSER_white_Logo.png`, {
      signal: AbortSignal.timeout(8000),
    });
    if (logoRes.ok) logoBytes = new Uint8Array(await logoRes.arrayBuffer());
  } catch {
    logoBytes = null;
  }

  const addPage = async () => {
    const page = pdf.addPage([PAGE_W, PAGE_H]);
    await paintHeader(pdf, page, font, logoBytes);
    paintFooter(page, font, "Techlyser · Website Growth Audit");
    return page;
  };

  {
    const page = await addPage();
    let y = 700;
    page.drawText("WEBSITE GROWTH AUDIT", {
      x: 40,
      y,
      size: 10,
      font: fontBold,
      color: ORANGE,
    });
    y -= 28;
    page.drawText("Is your website helping your", {
      x: 40,
      y,
      size: 20,
      font: fontBold,
      color: BLACK,
    });
    y -= 24;
    page.drawText("business grow?", { x: 40, y, size: 20, font: fontBold, color: BLACK });
    y -= 28;
    page.drawText(`URL: ${input.websiteUrl}`.slice(0, 90), {
      x: 40,
      y,
      size: 10,
      font,
      color: MUTED,
    });
    y -= 16;
    if (input.businessName) {
      page.drawText(`Business: ${input.businessName}`.slice(0, 80), {
        x: 40,
        y,
        size: 10,
        font,
        color: MUTED,
      });
      y -= 16;
    }
    const score =
      input.result.overallScore == null ? "N/A" : String(input.result.overallScore);
    page.drawRectangle({
      x: 40,
      y: y - 70,
      width: 100,
      height: 70,
      color: rgb(0.97, 0.98, 0.99),
      borderColor: LINE,
      borderWidth: 1,
    });
    page.drawText(score, { x: 58, y: y - 42, size: 28, font: fontBold, color: ORANGE });
    page.drawText("Overall / 100", { x: 52, y: y - 60, size: 9, font, color: MUTED });

    const platform = input.result.platform;
    const meta = [
      `Checks: ${input.result.checksPerformed} verified · ${input.result.checksUnavailable} unavailable`,
      `Platform: ${platform?.platform || "unknown"}${platform?.themeHint ? ` · Theme: ${platform.themeHint}` : ""}`,
      `Pages: ${input.result.pages.map((p) => pageKindLabel(p.kind || "other")).join(", ") || "Homepage"}`,
    ];
    let my = y - 20;
    for (const line of meta) {
      page.drawText(line.slice(0, 85), { x: 160, y: my, size: 10, font, color: BLACK });
      my -= 16;
    }

    y = my - 30;
    page.drawText("Category scores", { x: 40, y, size: 13, font: fontBold, color: BLACK });
    y -= 18;
    for (const c of input.result.categoryScores.slice(0, 7)) {
      const line = `${c.label}: ${c.score == null ? "N/A" : `${c.score}/100`} — ${c.summary}`;
      for (const wrapped of wrapText(line, 92).slice(0, 2)) {
        page.drawText(wrapped, { x: 40, y, size: 9, font, color: MUTED });
        y -= 12;
      }
      y -= 4;
      if (y < 60) break;
    }
  }

  const shots = input.screenshots || [];
  const groups = [
    { title: "Desktop experience", items: shots.filter((s) => s.device === "desktop") },
    { title: "Mobile experience", items: shots.filter((s) => s.device === "mobile") },
  ];

  for (const group of groups) {
    if (group.items.length === 0) continue;
    for (let i = 0; i < group.items.length; i += 2) {
      const page = await addPage();
      let y = 700;
      page.drawText(group.title.toUpperCase(), {
        x: 40,
        y,
        size: 10,
        font: fontBold,
        color: ORANGE,
      });
      y -= 22;
      page.drawText("Actual vs suggested visuals", {
        x: 40,
        y,
        size: 14,
        font: fontBold,
        color: BLACK,
      });
      y -= 18;

      const pair = group.items.slice(i, i + 2);
      for (const shot of pair) {
        if (y < 120) break;
        page.drawText(
          `${shot.kind === "actual" ? "ACTUAL" : "SUGGESTED"} · ${shot.pageLabel}`.slice(0, 60),
          {
            x: 40,
            y,
            size: 10,
            font: fontBold,
            color: shot.kind === "actual" ? rgb(0.6, 0.1, 0.1) : ORANGE,
          },
        );
        y -= 12;
        const boxH = shot.device === "mobile" ? 150 : 120;
        const boxW = shot.device === "mobile" ? 120 : 532;
        page.drawRectangle({
          x: 40,
          y: y - boxH,
          width: boxW,
          height: boxH,
          color: rgb(0.06, 0.09, 0.14),
        });
        if (shot.kind === "actual" && shot.imageBytes) {
          try {
            const img =
              shot.mimeType === "image/png"
                ? await pdf.embedPng(shot.imageBytes)
                : await pdf.embedJpg(shot.imageBytes);
            const scale = Math.min(boxW / img.width, boxH / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            page.drawImage(img, { x: 40, y: y - h, width: w, height: h });
          } catch {
            page.drawText("Screenshot unavailable", {
              x: 50,
              y: y - boxH / 2,
              size: 10,
              font,
              color: rgb(1, 1, 1),
            });
          }
        } else {
          page.drawRectangle({
            x: 48,
            y: y - boxH + 12,
            width: boxW - 16,
            height: boxH - 24,
            color: rgb(1, 0.97, 0.93),
            borderColor: ORANGE,
            borderWidth: 1,
          });
          const concept = wrapText(
            `Illustrative concept for ${shot.pageLabel}: clearer hierarchy, stronger CTA, improved spacing.`,
            shot.device === "mobile" ? 18 : 70,
          );
          let ty = y - 36;
          for (const line of concept.slice(0, 5)) {
            page.drawText(line, { x: 56, y: ty, size: 9, font, color: ORANGE });
            ty -= 12;
          }
        }
        y -= boxH + 8;
        for (const line of wrapText(shot.caption, 95).slice(0, 2)) {
          page.drawText(line, { x: 40, y, size: 8, font, color: MUTED });
          y -= 11;
        }
        y -= 12;
      }
    }
  }

  {
    const page = await addPage();
    let y = 700;
    page.drawText("RECOMMENDATIONS", { x: 40, y, size: 10, font: fontBold, color: ORANGE });
    y -= 22;
    page.drawText("Prioritized growth opportunities", {
      x: 40,
      y,
      size: 14,
      font: fontBold,
      color: BLACK,
    });
    y -= 20;
    for (const [index, rec] of input.recommendations.slice(0, 6).entries()) {
      if (y < 90) break;
      page.drawText(`${index + 1}. ${rec.problemTitle}`.slice(0, 80), {
        x: 40,
        y,
        size: 11,
        font: fontBold,
        color: BLACK,
      });
      y -= 14;
      page.drawText(`[${rec.priority}]`, { x: 40, y, size: 9, font: fontBold, color: ORANGE });
      y -= 12;
      for (const line of wrapText(rec.recommendation, 95).slice(0, 3)) {
        page.drawText(line, { x: 40, y, size: 9, font, color: MUTED });
        y -= 11;
      }
      y -= 8;
    }
    if (input.result.platform?.themeHint) {
      y -= 4;
      for (const line of wrapText(
        `Beyond these points, additional improvements related to ${input.result.platform.themeHint} may further enhance design and functionality.`,
        95,
      )) {
        if (y < 70) break;
        page.drawText(line, { x: 40, y, size: 9, font, color: BLACK });
        y -= 11;
      }
    }
    y -= 14;
    page.drawText("Next step", { x: 40, y, size: 12, font: fontBold, color: BLACK });
    y -= 14;
    for (const line of wrapText(
      "I’d be happy to walk you through these recommendations and discuss how we can implement them.",
      95,
    )) {
      page.drawText(line, { x: 40, y, size: 9, font, color: MUTED });
      y -= 11;
    }
    y -= 8;
    page.drawText(`${siteConfig.url}/contact · ${siteConfig.phoneDisplay}`, {
      x: 40,
      y,
      size: 10,
      font: fontBold,
      color: ORANGE,
    });
  }

  const bytes = await pdf.save();
  return Buffer.from(bytes).toString("base64");
}

export { CATEGORY_LABELS };
