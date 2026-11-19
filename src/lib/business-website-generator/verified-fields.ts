/** Pull only verified extras from OSM/source metadata — never invent. */

function asTags(sourceMetadata: unknown): Record<string, string> {
  if (!sourceMetadata || typeof sourceMetadata !== "object") return {};
  const record = sourceMetadata as Record<string, unknown>;
  const tags = record.tags;
  if (!tags || typeof tags !== "object" || Array.isArray(tags)) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(tags as Record<string, unknown>)) {
    if (typeof value === "string" && value.trim()) out[key] = value.trim();
  }
  return out;
}

export type VerifiedExtras = {
  degree: string | null;
  specialty: string | null;
  operator: string | null;
  cuisine: string | null;
  /** English listing name when OSM provides name:en (or Latin operator). */
  englishName: string | null;
  extraLines: string[];
};

const DEVANAGARI = /[\u0900-\u097F]/;

function titleCaseSpecialty(value: string) {
  return value
    .split(/[\s_/]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function looksLatinName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (DEVANAGARI.test(trimmed)) return false;
  return /[A-Za-z]/.test(trimmed);
}

export function extractVerifiedExtras(input: {
  description?: string | null;
  businessName?: string | null;
  sourceMetadata?: unknown;
}): VerifiedExtras {
  const tags = asTags(input.sourceMetadata);
  const degree =
    tags["healthcare:degree"] ||
    tags.degree ||
    tags.qualification ||
    tags["doctor:title"] ||
    null;
  const specialtyRaw =
    tags["healthcare:speciality"] ||
    tags["healthcare:specialty"] ||
    tags.speciality ||
    tags.specialty ||
    tags["healthcare:speciality_1"] ||
    null;
  const specialty = specialtyRaw ? titleCaseSpecialty(specialtyRaw) : null;
  const operator = tags.operator || tags.brand || null;
  const cuisine = tags.cuisine || null;

  const englishCandidates = [
    tags["name:en"],
    tags["official_name:en"],
    operator,
    looksLatinName(input.businessName || "") ? input.businessName : null,
    looksLatinName(tags.name || "") ? tags.name : null,
  ].filter((v): v is string => Boolean(v && looksLatinName(v)));

  const englishName = englishCandidates[0]?.trim() || null;

  const extraLines: string[] = [];
  if (degree) extraLines.push(degree);
  if (specialty) extraLines.push(specialty);
  if (cuisine) extraLines.push(`Cuisine: ${cuisine}`);
  if (operator && operator !== tags.name) extraLines.push(operator);

  // Soft parse description for degree-like tokens only if explicit.
  if (!degree && input.description) {
    const match = input.description.match(
      /\b(MBBS|MD|MS|BDS|MDS|BAMS|BHMS|DNB|PhD|Dr\.)\b[\w\s.,/-]{0,40}/i,
    );
    if (match) extraLines.unshift(match[0].trim());
  }

  return {
    degree: degree || (extraLines[0]?.match(/MBBS|MD|MS|BDS|MDS|BAMS|BHMS|DNB|PhD|Dr\./i) ? extraLines[0] : null),
    specialty,
    operator,
    cuisine,
    englishName,
    extraLines: [...new Set(extraLines)].slice(0, 4),
  };
}

/** Prefer English listing name for website/PDF copy; keep original for records. */
export function resolveDisplayName(input: {
  businessName: string;
  englishName?: string | null;
}) {
  if (input.englishName && looksLatinName(input.englishName)) {
    return input.englishName.trim();
  }
  if (looksLatinName(input.businessName)) return input.businessName.trim();
  return input.businessName.trim();
}
