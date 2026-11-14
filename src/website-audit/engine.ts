import { analyzeTechnical } from "@/website-audit/analyzers";
import { crawlSite } from "@/website-audit/crawler";
import { measurePagespeed } from "@/website-audit/performance";
import { scoreCategories } from "@/website-audit/score";
import type { TechnicalAuditResult } from "@/website-audit/types";

export async function runTechnicalAudit(normalizedUrl: string): Promise<TechnicalAuditResult> {
  const site = await crawlSite(normalizedUrl);
  const baseFindings = analyzeTechnical(site).filter((f) => f.category !== "performance");
  const perfFindings = await measurePagespeed(site.homepageUrl);
  const findings = [...baseFindings, ...perfFindings];
  const scored = scoreCategories(findings);

  return {
    normalizedUrl: site.homepageUrl,
    pages: site.pages.map(({ html: _html, ...page }) => page),
    findings,
    categoryScores: scored.categoryScores,
    overallScore: scored.overallScore,
    checksPerformed: scored.checksPerformed,
    checksUnavailable: scored.checksUnavailable,
    auditedAt: new Date().toISOString(),
    limitations: site.limitations,
  };
}
