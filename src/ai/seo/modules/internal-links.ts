import { SEO_HUB_LINKS } from "../config";
import type {
  SeoInternalLink,
  SeoInternalLinksResult,
  SeoModuleContext,
} from "../types";

function scoreLink(
  content: string,
  keyword: string,
  linkKeywords: readonly string[],
): number {
  const hay = `${content} ${keyword}`.toLowerCase();
  return linkKeywords.reduce(
    (score, kw) => (hay.includes(kw.toLowerCase()) ? score + 1 : score),
    0,
  );
}

export function optimizeInternalLinks(
  ctx: SeoModuleContext,
): SeoInternalLinksResult {
  const issues: string[] = [];
  const plain = ctx.content.toLowerCase();
  const links: SeoInternalLink[] = [];

  for (const hub of SEO_HUB_LINKS) {
    const alreadyLinked = plain.includes(`href="${hub.href}"`) ||
      plain.includes(`href='${hub.href}'`);
    if (alreadyLinked) continue;

    const score = scoreLink(ctx.content, ctx.primaryKeyword, hub.keywords);
    if (score > 0 || hub.href === "/resources" || hub.href === "/contact") {
      links.push({
        anchor: hub.anchor,
        href: hub.href,
        reason:
          score > 0
            ? `Keyword overlap (${score}) with hub`
            : "Default topical hub for crawlability",
      });
    }
  }

  if (ctx.clusterPath) {
    const path = ctx.clusterPath.startsWith("/")
      ? ctx.clusterPath
      : `/${ctx.clusterPath}`;
    if (!links.some((l) => l.href === path)) {
      links.unshift({
        anchor: "related pillar guide",
        href: path,
        reason: "Cluster pillar path from planner",
      });
    }
  }

  const limited = links.slice(0, 6);
  if (limited.length < 2) {
    issues.push("Fewer than 2 internal link opportunities found");
  }

  const suggestedHtmlSnippet = limited.length
    ? `<nav class="related-internal-links" aria-label="Related resources"><h2>Related resources</h2><ul>${limited
        .map(
          (l) =>
            `<li><a href="${l.href}">${l.anchor}</a></li>`,
        )
        .join("")}</ul></nav>`
    : "";

  return { links: limited, suggestedHtmlSnippet, issues };
}
