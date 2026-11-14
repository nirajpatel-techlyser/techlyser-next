import type { AuditFinding } from "@/website-audit/types";

type PsiMetric = {
  percentile?: number;
};

/**
 * Optional PageSpeed Insights. Never invents scores when the API is unavailable.
 */
export async function measurePagespeed(url: string): Promise<AuditFinding[]> {
  const key = process.env.PAGESPEED_API_KEY?.trim();
  if (!key) {
    return [
      {
        id: "performance-psi-unconfigured",
        category: "performance",
        title: "PageSpeed Insights not configured",
        observation: "No PAGESPEED_API_KEY is set, so live Core Web Vitals were not fetched.",
        whyItMatters: "Measured performance prevents guessing about speed issues.",
        recommendation: "Add PAGESPEED_API_KEY to enable LCP/INP/CLS measurements.",
        severity: "info",
        confidence: "not_tested",
        scoreImpact: 0,
        passed: false,
        available: false,
      },
    ];
  }

  try {
    const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    endpoint.searchParams.set("url", url);
    endpoint.searchParams.set("strategy", "mobile");
    endpoint.searchParams.set("category", "PERFORMANCE");
    endpoint.searchParams.set("key", key);

    const response = await fetch(endpoint, { signal: AbortSignal.timeout(25000) });
    if (!response.ok) {
      return [
        {
          id: "performance-psi-failed",
          category: "performance",
          title: "PageSpeed Insights unavailable",
          observation: `PageSpeed API returned HTTP ${response.status}.`,
          whyItMatters: "Without measurements we cannot score live performance.",
          recommendation: "Retry later or verify the PageSpeed API key/quota.",
          severity: "info",
          confidence: "unable_to_verify",
          scoreImpact: 0,
          passed: false,
          available: false,
        },
      ];
    }

    const data = (await response.json()) as {
      lighthouseResult?: {
        audits?: Record<string, { displayValue?: string; numericValue?: number; score?: number | null }>;
        categories?: { performance?: { score?: number | null } };
      };
      loadingExperience?: {
        metrics?: Record<string, PsiMetric>;
      };
    };

    const perfScore = data.lighthouseResult?.categories?.performance?.score;
    const lcp = data.lighthouseResult?.audits?.["largest-contentful-paint"];
    const cls = data.lighthouseResult?.audits?.["cumulative-layout-shift"];
    const inp = data.lighthouseResult?.audits?.["interaction-to-next-paint"];

    const findings: AuditFinding[] = [
      {
        id: "performance-lighthouse-score",
        category: "performance",
        title: "Lighthouse performance score (mobile)",
        observation:
          typeof perfScore === "number"
            ? `Lighthouse performance score: ${Math.round(perfScore * 100)}/100.`
            : "Lighthouse performance score was missing from the API response.",
        whyItMatters: "A lab performance score highlights load and interactivity risk.",
        recommendation:
          typeof perfScore === "number" && perfScore < 0.7
            ? "Prioritize image optimization, script reduction, and server response time."
            : "Monitor performance as content and scripts change.",
        severity:
          typeof perfScore === "number" && perfScore < 0.5
            ? "high"
            : typeof perfScore === "number" && perfScore < 0.7
              ? "medium"
              : "info",
        confidence: typeof perfScore === "number" ? "verified" : "unable_to_verify",
        evidence: "Google PageSpeed Insights API (mobile strategy)",
        scoreImpact:
          typeof perfScore === "number"
            ? perfScore >= 0.9
              ? 0
              : perfScore >= 0.7
                ? 3
                : perfScore >= 0.5
                  ? 6
                  : 9
            : 0,
        passed: typeof perfScore === "number" ? perfScore >= 0.7 : false,
        available: typeof perfScore === "number",
      },
    ];

    if (lcp?.displayValue) {
      findings.push({
        id: "performance-lcp",
        category: "performance",
        title: "Largest Contentful Paint",
        observation: `LCP reported as ${lcp.displayValue}.`,
        whyItMatters: "Slow LCP makes the page feel unresponsive on first load.",
        recommendation: "Optimize hero media, fonts, and critical rendering path.",
        severity: (lcp.numericValue || 0) > 4000 ? "high" : "medium",
        confidence: "verified",
        evidence: "PageSpeed Insights lighthouse audit",
        scoreImpact: (lcp.numericValue || 0) > 4000 ? 6 : 3,
        passed: (lcp.numericValue || 0) <= 2500,
        available: true,
      });
    }

    if (cls?.displayValue) {
      findings.push({
        id: "performance-cls",
        category: "performance",
        title: "Cumulative Layout Shift",
        observation: `CLS reported as ${cls.displayValue}.`,
        whyItMatters: "Layout shifts reduce trust and cause mis-taps.",
        recommendation: "Reserve image/ad space and avoid late-loading above-the-fold content.",
        severity: (cls.numericValue || 0) > 0.25 ? "high" : "low",
        confidence: "verified",
        evidence: "PageSpeed Insights lighthouse audit",
        scoreImpact: (cls.numericValue || 0) > 0.25 ? 5 : 2,
        passed: (cls.numericValue || 0) <= 0.1,
        available: true,
      });
    }

    if (inp?.displayValue) {
      findings.push({
        id: "performance-inp",
        category: "performance",
        title: "Interaction to Next Paint",
        observation: `INP reported as ${inp.displayValue}.`,
        whyItMatters: "High INP means clicks/taps feel laggy.",
        recommendation: "Reduce long tasks and defer non-critical JavaScript.",
        severity: "medium",
        confidence: "verified",
        evidence: "PageSpeed Insights lighthouse audit",
        scoreImpact: 3,
        passed: (inp.score || 0) >= 0.9,
        available: true,
      });
    }

    return findings;
  } catch (error) {
    return [
      {
        id: "performance-psi-error",
        category: "performance",
        title: "PageSpeed Insights request failed",
        observation: error instanceof Error ? error.message : "Unknown PSI error",
        whyItMatters: "Performance scoring needs a successful measurement run.",
        recommendation: "Retry the audit when the PageSpeed API is reachable.",
        severity: "info",
        confidence: "unable_to_verify",
        scoreImpact: 0,
        passed: false,
        available: false,
      },
    ];
  }
}
