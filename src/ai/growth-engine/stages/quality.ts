import { isAllowedInternalHref } from "@/ai/brand/positioning";
import { isOffBrandProductTopic } from "@/ai/brand/niche";
import { GROWTH_QUALITY_THRESHOLDS } from "../config";
import type { GrowthQualityInput, GrowthQualityResult } from "../types";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

const AI_CLICHE_RE =
  /\b(in today's (fast-paced|digital) (world|landscape)|unlock the power|game-changer|cutting-edge solutions|leverage synergies)\b/i;

/**
 * validateContent() — post-draft gate before auto-publish.
 * Fail keeps DRAFT and blocks publish.
 */
export function validateContent(input: GrowthQualityInput): GrowthQualityResult {
  const checks: GrowthQualityResult["checks"] = [];

  const growth = input.techlyserGrowthScore ?? 0;
  checks.push({
    id: "techlyserGrowthScore",
    ok: growth >= GROWTH_QUALITY_THRESHOLDS.minTechlyserGrowthScore,
    detail: `techlyserGrowthScore ${growth} (min ${GROWTH_QUALITY_THRESHOLDS.minTechlyserGrowthScore})`,
  });

  checks.push({
    id: "thirdPartyTitle",
    ok: !isOffBrandProductTopic(input.title, input.slug, input.excerpt),
    detail: "No unnecessary third-party promotion in title/slug",
  });

  const seo = input.seoScore ?? 0;
  const geo = input.geoScore ?? 0;
  checks.push({
    id: "seoScore",
    ok: seo >= GROWTH_QUALITY_THRESHOLDS.minSeoScore,
    detail: `SEO ${seo} (min ${GROWTH_QUALITY_THRESHOLDS.minSeoScore})`,
  });
  checks.push({
    id: "geoScore",
    ok: geo >= GROWTH_QUALITY_THRESHOLDS.minGeoScore,
    detail: `GEO ${geo} (min ${GROWTH_QUALITY_THRESHOLDS.minGeoScore})`,
  });

  checks.push({
    id: "seoTitle",
    ok: Boolean(input.seoTitle?.trim()),
    detail: "SEO title exists",
  });
  checks.push({
    id: "seoDescription",
    ok: Boolean(input.seoDescription?.trim() && input.seoDescription.length >= 80),
    detail: "SEO description exists",
  });
  checks.push({
    id: "slug",
    ok: Boolean(input.slug?.trim()),
    detail: "Slug exists",
  });
  checks.push({
    id: "tags",
    ok: Array.isArray(input.tags) && input.tags.length >= 2,
    detail: "Tags exist",
  });
  checks.push({
    id: "category",
    ok: Boolean(input.category?.trim()),
    detail: "Category exists",
  });

  const reading = input.readingTimeMinutes ?? 0;
  const contentLen = input.contentLength ?? 0;
  checks.push({
    id: "readingTime",
    ok: reading >= GROWTH_QUALITY_THRESHOLDS.minReadingMinutes,
    detail: `Reading time ${reading} min`,
  });
  checks.push({
    id: "contentLength",
    ok: contentLen >= GROWTH_QUALITY_THRESHOLDS.minContentChars,
    detail: `Content length ${contentLen}`,
  });

  const body = input.articleMarkdownOrHtml || "";
  const hasHeadings =
    /<h2[\s>]/i.test(body) ||
    /^##\s+/m.test(body) ||
    contentLen >= GROWTH_QUALITY_THRESHOLDS.minContentChars;
  checks.push({
    id: "headings",
    ok: hasHeadings,
    detail: "Website article has proper headings / length",
  });

  checks.push({
    id: "aiCliches",
    ok: !AI_CLICHE_RE.test(`${input.title} ${input.excerpt || ""} ${body.slice(0, 2000)}`),
    detail: "No generic AI clichés in lead content",
  });

  const cta = (input.ctaHref || "").trim();
  const ctaOk = !cta || isAllowedInternalHref(cta);
  checks.push({
    id: "ctaHref",
    ok: ctaOk,
    detail: cta ? `CTA href ${cta}` : "No CTA href (neutral)",
  });

  const passed = checks.filter((c) => c.ok).length;
  const score = clamp01(passed / checks.length);
  const ok = checks.every((c) => c.ok);

  return { ok, score, checks };
}

/** Alias used by autopilot. */
export function runGrowthQualityCheck(
  input: GrowthQualityInput,
): GrowthQualityResult {
  return validateContent(input);
}
