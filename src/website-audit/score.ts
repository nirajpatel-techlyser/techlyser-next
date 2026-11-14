import {
  CATEGORY_LABELS,
  type AuditCategoryId,
  type AuditFinding,
  type CategoryScore,
} from "@/website-audit/types";

const CATEGORIES: AuditCategoryId[] = [
  "seo",
  "uiux",
  "conversion",
  "performance",
  "mobile",
  "content",
  "trust",
];

export function scoreCategories(findings: AuditFinding[]): {
  categoryScores: CategoryScore[];
  overallScore: number | null;
  checksPerformed: number;
  checksUnavailable: number;
} {
  const categoryScores: CategoryScore[] = CATEGORIES.map((id) => {
    const rows = findings.filter((f) => f.category === id);
    const available = rows.filter((f) => f.available);
    const unavailable = rows.filter((f) => !f.available);
    if (available.length === 0) {
      return {
        id,
        label: CATEGORY_LABELS[id],
        score: null,
        checksPerformed: 0,
        checksUnavailable: unavailable.length,
        summary: "Insufficient data for this category.",
      };
    }
    const maxImpact = available.reduce((sum, f) => sum + Math.max(f.scoreImpact, 1), 0);
    const lost = available.reduce((sum, f) => sum + (f.passed ? 0 : f.scoreImpact), 0);
    const raw = maxImpact === 0 ? 100 : Math.round(100 - (lost / maxImpact) * 100);
    const score = Math.max(0, Math.min(100, raw));
    const failed = available.filter((f) => !f.passed).length;
    return {
      id,
      label: CATEGORY_LABELS[id],
      score,
      checksPerformed: available.length,
      checksUnavailable: unavailable.length,
      summary:
        failed === 0
          ? "No major issues detected in available checks."
          : `${failed} improvement opportunity${failed === 1 ? "" : "ies"} from available checks.`,
    };
  });

  const scored = categoryScores.filter((c) => typeof c.score === "number");
  const overallScore =
    scored.length === 0
      ? null
      : Math.round(
          scored.reduce((sum, c) => sum + (c.score as number), 0) / scored.length,
        );

  return {
    categoryScores,
    overallScore,
    checksPerformed: findings.filter((f) => f.available).length,
    checksUnavailable: findings.filter((f) => !f.available).length,
  };
}
