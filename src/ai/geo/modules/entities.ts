import { BRAND_ENTITY_GRAPH } from "../config";
import type { GeoEntity, GeoOptimizeInput } from "../types";

function includesAny(haystack: string, needles: readonly string[]) {
  const h = haystack.toLowerCase();
  return needles.some((n) => h.includes(n.toLowerCase()));
}

export function optimizeEntityCoverage(input: GeoOptimizeInput): {
  entities: GeoEntity[];
  covered: number;
  total: number;
  missing: string[];
} {
  const hay = `${input.title}\n${input.content}\n${(input.brandEntities || []).join(" ")}`;

  const entities: GeoEntity[] = BRAND_ENTITY_GRAPH.map((entity) => {
    const present = includesAny(hay, [entity.name, ...entity.aliases]);
    return {
      name: entity.name,
      type: entity.type,
      sameAs: [...entity.sameAs],
      present,
      recommendedMention: present
        ? undefined
        : `Mention ${entity.name} (${entity.type}) for stronger entity coverage.`,
    };
  });

  // Keyword-specific soft entity
  if (input.primaryKeyword) {
    const present = hay.toLowerCase().includes(input.primaryKeyword.toLowerCase());
    entities.push({
      name: input.primaryKeyword,
      type: "Thing",
      present,
      recommendedMention: present
        ? undefined
        : `Repeat primary keyword "${input.primaryKeyword}" in the opening answer block.`,
    });
  }

  const missing = entities.filter((e) => !e.present).map((e) => e.name);
  const covered = entities.filter((e) => e.present).length;

  return {
    entities,
    covered,
    total: entities.length,
    missing,
  };
}
