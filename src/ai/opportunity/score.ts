import {
  COMMERCIAL_TERMS,
  INFORMATIONAL_TERMS,
  OPPORTUNITY_WEIGHTS,
  SOURCE_AUTHORITY,
  SOURCE_COMPETITION_PRESSURE,
  TECHLYSER_FOCUS,
  TRANSACTIONAL_TERMS,
} from "./config";
import type {
  FactorScore,
  OpportunityCorpus,
  ResearchItemLike,
  ScoredOpportunity,
} from "./types";

function clamp01(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(3))));
}

function haystackOf(item: ResearchItemLike) {
  return `${item.title} ${item.summary || ""} ${item.keywords.join(" ")} ${item.category}`.toLowerCase();
}

function tokenOverlap(a: string, b: string): number {
  const ta = new Set(a.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2));
  const tb = new Set(b.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2));
  if (ta.size === 0 || tb.size === 0) return 0;
  let hit = 0;
  for (const t of ta) if (tb.has(t)) hit += 1;
  return hit / Math.max(ta.size, 1);
}

export function detectIntentLabel(item: ResearchItemLike): string {
  const hay = haystackOf(item);
  const commercial = COMMERCIAL_TERMS.some((t) => hay.includes(t));
  const transactional = TRANSACTIONAL_TERMS.some((t) => hay.includes(t));
  const informational = INFORMATIONAL_TERMS.some((t) => hay.includes(t));

  if (transactional && commercial) return "commercial+transactional";
  if (commercial) return "commercial";
  if (transactional) return "transactional";
  if (informational) return "informational";
  return "navigational/general";
}

function scoreSearchIntent(item: ResearchItemLike): FactorScore {
  const hay = haystackOf(item);
  let score = 0.25;
  if (INFORMATIONAL_TERMS.some((t) => hay.includes(t))) score += 0.35;
  if (hay.includes("guide") || hay.includes("checklist") || hay.includes("how to")) {
    score += 0.2;
  }
  if (item.category === "seo" || item.category === "engineering") score += 0.1;
  return {
    id: "searchIntent",
    score: clamp01(score),
    weight: OPPORTUNITY_WEIGHTS.searchIntent,
    note: "Informational/guide phrasing increases searchable intent fit",
  };
}

function scoreCommercialIntent(item: ResearchItemLike): FactorScore {
  const hay = haystackOf(item);
  let score = 0.1;
  for (const term of COMMERCIAL_TERMS) {
    if (hay.includes(term)) score += 0.08;
  }
  for (const term of TRANSACTIONAL_TERMS) {
    if (hay.includes(term)) score += 0.06;
  }
  if (hay.includes("shopify") && (hay.includes("agency") || hay.includes("developers"))) {
    score += 0.15;
  }
  return {
    id: "commercialIntent",
    score: clamp01(score),
    weight: OPPORTUNITY_WEIGHTS.commercialIntent,
    note: "Buyer-language and service keywords raise commercial intent",
  };
}

function scoreCompetition(item: ResearchItemLike): FactorScore {
  const pressure =
    SOURCE_COMPETITION_PRESSURE[item.source] ??
    SOURCE_COMPETITION_PRESSURE.OTHER;
  // High pressure => lower opportunity from competition factor
  const score = clamp01(1 - pressure * 0.85);
  return {
    id: "competition",
    score,
    weight: OPPORTUNITY_WEIGHTS.competition,
    note: `Source competition pressure ${(pressure * 100).toFixed(0)}% → opportunity ${score}`,
  };
}

function scoreTrend(item: ResearchItemLike): FactorScore {
  let score = item.relevanceScore * 0.6;
  if (item.source === "GOOGLE_TRENDS") score += 0.35;
  if (item.source === "PRODUCT_HUNT" || item.source === "HACKER_NEWS") score += 0.15;
  if (item.source === "GITHUB_TRENDING") score += 0.12;
  return {
    id: "trend",
    score: clamp01(score),
    weight: OPPORTUNITY_WEIGHTS.trend,
    note: "Trend boost from source type + research relevance",
  };
}

function scoreFreshness(item: ResearchItemLike): FactorScore {
  if (!item.publishedAt) {
    return {
      id: "freshness",
      score: 0.35,
      weight: OPPORTUNITY_WEIGHTS.freshness,
      note: "Unknown publish date — neutral freshness",
    };
  }
  const ageDays =
    (Date.now() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
  let score = 0.15;
  if (ageDays <= 3) score = 1;
  else if (ageDays <= 14) score = 0.85;
  else if (ageDays <= 45) score = 0.65;
  else if (ageDays <= 120) score = 0.4;
  else score = 0.2;
  return {
    id: "freshness",
    score: clamp01(score),
    weight: OPPORTUNITY_WEIGHTS.freshness,
    note: `Age ~${Math.max(0, Math.round(ageDays))} days`,
  };
}

function scoreTechlyserRelevance(item: ResearchItemLike): FactorScore {
  const hay = haystackOf(item);
  let hits = 0;
  for (const term of TECHLYSER_FOCUS) {
    if (hay.includes(term)) hits += 1;
  }
  const score = clamp01(0.1 + hits * 0.09 + item.relevanceScore * 0.35);
  return {
    id: "techlyserRelevance",
    score,
    weight: OPPORTUNITY_WEIGHTS.techlyserRelevance,
    note: `Matched ${hits} Techlyser focus terms`,
  };
}

function scoreExistingContent(
  item: ResearchItemLike,
  corpus: OpportunityCorpus,
): FactorScore {
  let best = 0;
  for (const title of corpus.blogTitles) {
    best = Math.max(best, tokenOverlap(item.title, title));
  }
  // High overlap = we already cover it → lower opportunity
  const gapScore = clamp01(1 - best);
  return {
    id: "existingContent",
    score: gapScore,
    weight: OPPORTUNITY_WEIGHTS.existingContent,
    note:
      best > 0.45
        ? `Similar existing post overlap ${(best * 100).toFixed(0)}%`
        : "No close existing post — content gap",
  };
}

function scoreKeywordGap(
  item: ResearchItemLike,
  corpus: OpportunityCorpus,
): FactorScore {
  const itemKeywords = item.keywords.map((k) => k.toLowerCase()).filter(Boolean);
  if (itemKeywords.length === 0) {
    return {
      id: "keywordGap",
      score: 0.4,
      weight: OPPORTUNITY_WEIGHTS.keywordGap,
      note: "No explicit keywords on research item",
    };
  }

  const owned = new Set(
    [...corpus.blogKeywords, ...corpus.trackedKeywords].map((k) => k.toLowerCase()),
  );
  let missing = 0;
  for (const kw of itemKeywords) {
    const covered = [...owned].some(
      (o) => o === kw || o.includes(kw) || kw.includes(o),
    );
    if (!covered) missing += 1;
  }
  const score = clamp01(missing / itemKeywords.length);
  return {
    id: "keywordGap",
    score,
    weight: OPPORTUNITY_WEIGHTS.keywordGap,
    note: `${missing}/${itemKeywords.length} keywords not covered in CMS/tracked set`,
  };
}

function scoreAuthorityGap(
  item: ResearchItemLike,
  corpus: OpportunityCorpus,
): FactorScore {
  const authority = SOURCE_AUTHORITY[item.source] ?? SOURCE_AUTHORITY.OTHER;
  let best = 0;
  for (const title of corpus.blogTitles) {
    best = Math.max(best, tokenOverlap(item.title, title));
  }
  const uncovered = clamp01(1 - best);
  const score = clamp01(authority * 0.55 + uncovered * 0.45);
  return {
    id: "authorityGap",
    score,
    weight: OPPORTUNITY_WEIGHTS.authorityGap,
    note: `Authority ${(authority * 100).toFixed(0)}% × coverage gap`,
  };
}

export function scoreResearchItem(
  item: ResearchItemLike,
  corpus: OpportunityCorpus,
): ScoredOpportunity {
  const factors: FactorScore[] = [
    scoreSearchIntent(item),
    scoreCommercialIntent(item),
    scoreCompetition(item),
    scoreTrend(item),
    scoreFreshness(item),
    scoreTechlyserRelevance(item),
    scoreExistingContent(item, corpus),
    scoreKeywordGap(item, corpus),
    scoreAuthorityGap(item, corpus),
  ];

  const opportunityScore = clamp01(
    factors.reduce((sum, f) => sum + f.score * f.weight, 0),
  );

  const byId = Object.fromEntries(factors.map((f) => [f.id, f])) as Record<
    string,
    FactorScore
  >;

  const rationale = factors
    .slice()
    .sort((a, b) => b.score * b.weight - a.score * a.weight)
    .slice(0, 4)
    .map((f) => `${f.id}=${f.score} (${f.note})`)
    .join("; ");

  return {
    title: item.title,
    summary: item.summary || item.title,
    url: item.url,
    category: item.category,
    keywords: item.keywords,
    intentLabel: detectIntentLabel(item),
    opportunityScore,
    searchIntentScore: byId.searchIntent.score,
    commercialIntentScore: byId.commercialIntent.score,
    competitionScore: byId.competition.score,
    trendScore: byId.trend.score,
    freshnessScore: byId.freshness.score,
    techlyserRelevanceScore: byId.techlyserRelevance.score,
    existingContentScore: byId.existingContent.score,
    keywordGapScore: byId.keywordGap.score,
    authorityGapScore: byId.authorityGap.score,
    rationale,
    factors,
    researchItemId: item.id,
  };
}
