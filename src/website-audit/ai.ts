import { jsonrepair } from "jsonrepair";
import type { AiRecommendation, TechnicalAuditResult } from "@/website-audit/types";

function extractJsonArray(text: string): unknown {
  let candidate = text.trim();
  const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) candidate = fenced[1].trim();
  const start = candidate.indexOf("[");
  const end = candidate.lastIndexOf("]");
  if (start >= 0 && end > start) candidate = candidate.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return JSON.parse(jsonrepair(candidate));
  }
}

function fallbackRecommendations(result: TechnicalAuditResult): AiRecommendation[] {
  return result.findings
    .filter((f) => f.available && !f.passed)
    .sort((a, b) => b.scoreImpact - a.scoreImpact)
    .slice(0, 8)
    .map((f) => ({
      category: f.category,
      problemTitle: f.title,
      observation: f.observation,
      whyItMatters: f.whyItMatters,
      recommendation: f.recommendation,
      implementation: "Prioritize this based on business impact, then implement with design/dev support as needed.",
      expectedBenefit: "Clearer experience and fewer barriers for visitors taking the next step.",
      priority:
        f.severity === "critical"
          ? "Critical"
          : f.severity === "high"
            ? "High"
            : f.severity === "medium"
              ? "Medium"
              : "Low",
      evidence: f.evidence || "Technical audit finding",
      confidence: f.confidence,
    }));
}

export async function generateAiRecommendations(
  result: TechnicalAuditResult,
): Promise<AiRecommendation[]> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return fallbackRecommendations(result);

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";
  const evidence = result.findings
    .filter((f) => f.available)
    .slice(0, 40)
    .map((f) => ({
      category: f.category,
      title: f.title,
      observation: f.observation,
      passed: f.passed,
      severity: f.severity,
      confidence: f.confidence,
    }));

  const prompt = `You are a CRO, SEO, UX, and digital growth advisor for Techlyser.
Interpret ONLY the verified technical findings below. Do not invent rankings, analytics, conversion rates, or unmeasured scores.
Return a JSON array (max 10) of recommendations with keys:
category, problemTitle, observation, whyItMatters, recommendation, implementation, expectedBenefit, priority (Critical|High|Medium|Low), evidence, confidence (verified|potential|not_tested|unable_to_verify).
Website: ${result.normalizedUrl}
Limitations: ${result.limitations.join(" | ") || "none"}
Findings: ${JSON.stringify(evidence)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
        }),
        signal: AbortSignal.timeout(45000),
      },
    );
    if (!response.ok) return fallbackRecommendations(result);
    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") || "";
    const parsed = extractJsonArray(text);
    if (!Array.isArray(parsed) || parsed.length === 0) return fallbackRecommendations(result);
    return parsed
      .map((row) => {
        const item = row as Record<string, unknown>;
        return {
          category: String(item.category || "content"),
          problemTitle: String(item.problemTitle || "Improvement opportunity"),
          observation: String(item.observation || ""),
          whyItMatters: String(item.whyItMatters || ""),
          recommendation: String(item.recommendation || ""),
          implementation: String(item.implementation || ""),
          expectedBenefit: String(item.expectedBenefit || ""),
          priority: (["Critical", "High", "Medium", "Low"].includes(String(item.priority))
            ? String(item.priority)
            : "Medium") as AiRecommendation["priority"],
          evidence: String(item.evidence || "Technical findings"),
          confidence: (["verified", "potential", "not_tested", "unable_to_verify"].includes(
            String(item.confidence),
          )
            ? String(item.confidence)
            : "potential") as AiRecommendation["confidence"],
        };
      })
      .slice(0, 10);
  } catch {
    return fallbackRecommendations(result);
  }
}
