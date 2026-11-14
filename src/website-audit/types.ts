import type { PageKind } from "@/website-audit/platform";

export type AuditCategoryId =
  | "seo"
  | "uiux"
  | "conversion"
  | "performance"
  | "mobile"
  | "content"
  | "trust";

export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";

export type FindingConfidence = "verified" | "potential" | "not_tested" | "unable_to_verify";

export type AuditFinding = {
  id: string;
  category: AuditCategoryId;
  title: string;
  observation: string;
  whyItMatters: string;
  recommendation: string;
  severity: FindingSeverity;
  confidence: FindingConfidence;
  evidence?: string;
  scoreImpact: number; // 0–10 deducted when failed
  passed: boolean;
  available: boolean;
};

export type AnalyzedPage = {
  url: string;
  title: string | null;
  status: "ok" | "failed";
  error?: string;
  htmlLength?: number;
  kind?: PageKind;
};

export type PlatformSummary = {
  platform: string;
  themeHint: string | null;
  confidence: "verified" | "potential";
};

export type CategoryScore = {
  id: AuditCategoryId;
  label: string;
  score: number | null;
  checksPerformed: number;
  checksUnavailable: number;
  summary: string;
};

export type TechnicalAuditResult = {
  normalizedUrl: string;
  pages: AnalyzedPage[];
  findings: AuditFinding[];
  categoryScores: CategoryScore[];
  overallScore: number | null;
  checksPerformed: number;
  checksUnavailable: number;
  auditedAt: string;
  limitations: string[];
  platform?: PlatformSummary;
};

export type AiRecommendation = {
  category: AuditCategoryId | string;
  problemTitle: string;
  observation: string;
  whyItMatters: string;
  recommendation: string;
  implementation: string;
  expectedBenefit: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  evidence: string;
  confidence: FindingConfidence;
};

export const CATEGORY_LABELS: Record<AuditCategoryId, string> = {
  seo: "SEO & Visibility",
  uiux: "UI/UX & Design",
  conversion: "Conversion Readiness",
  performance: "Performance",
  mobile: "Mobile Experience",
  content: "Content Quality",
  trust: "Accessibility & Trust",
};
