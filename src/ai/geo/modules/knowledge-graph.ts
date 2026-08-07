import { siteConfig } from "@/lib/seo";
import { BRAND_ENTITY_GRAPH } from "../config";
import type { GeoEntity, GeoOptimizeOutput } from "../types";

export function optimizeKnowledgeGraph(input: {
  title: string;
  primaryKeyword: string;
  entities: GeoEntity[];
  canonicalUrl?: string;
}): GeoOptimizeOutput["knowledgeGraph"] {
  const brand = BRAND_ENTITY_GRAPH[0];
  const related = input.entities
    .filter((e) => e.present && e.name !== brand.name)
    .map((e) => e.name)
    .slice(0, 8);

  const sameAs = Array.from(
    new Set(
      input.entities.flatMap((e) => e.sameAs || []).filter(Boolean),
    ),
  );

  const jsonLdHint: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.legalName,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    knowsAbout: [input.primaryKeyword, ...related].slice(0, 10),
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    ...(input.canonicalUrl
      ? {
          subjectOf: {
            "@type": "Article",
            headline: input.title,
            url: input.canonicalUrl,
          },
        }
      : {}),
    sameAs,
  };

  return {
    primaryEntity: brand.name,
    relatedEntities: related,
    sameAs,
    jsonLdHint,
  };
}
