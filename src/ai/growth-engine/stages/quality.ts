import { isOffBrandProductTopic } from "@/ai/brand/niche";
import {
  GROWTH_ALLOWED_CTA_HREFS,
  GROWTH_QUALITY_THRESHOLDS,
} from "../config";
import type { GrowthQualityInput, GrowthQualityResult } from "../types";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Post-draft quality gate (heuristic, no extra LLM).
 * Fail keeps DRAFT and blocks auto-publish.
 */
export function runGrowthQualityCheck(
  input: GrowthQualityInput,
): GrowthQualityResult {
  const checks: GrowthQualityResult["checks"] = [];

  const seo = input.seoScore ?? 0;
  const geo = input.geoScore ?? 0;
  const reading = input.readingTimeMinutes ?? 0;
  const contentLen = input.contentLength ?? 0;
  const cta = (input.ctaHref || "").trim();

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
    id: "thirdPartyTitle",
    ok: !isOffBrandProductTopic(input.title, input.slug),
    detail: "Title/slug not a third-party product dump",
  });

  checks.push({
    id: "readingTime",
    ok: reading >= GROWTH_QUALITY_THRESHOLDS.minReadingMinutes,
    detail: `Reading time ${reading} min (min ${GROWTH_QUALITY_THRESHOLDS.minReadingMinutes})`,
  });

  checks.push({
    id: "contentLength",
    ok: contentLen >= GROWTH_QUALITY_THRESHOLDS.minContentChars,
    detail: `Content ${contentLen} chars (min ${GROWTH_QUALITY_THRESHOLDS.minContentChars})`,
  });

  const ctaOk =
    !cta ||
    (cta.startsWith("/") &&
      GROWTH_ALLOWED_CTA_HREFS.some(
        (href) => cta === href || cta.startsWith(`${href}/`),
      ));

  checks.push({
    id: "ctaHref",
    ok: ctaOk,
    detail: cta
      ? `CTA href ${cta}`
      : "No CTA href provided (neutral pass)",
  });

  const passed = checks.filter((c) => c.ok).length;
  const score = clamp01(passed / checks.length);
  const ok = checks.every((c) => c.ok);

  return { ok, score, checks };
}
