import { BlogStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { OpportunityCorpus, ResearchItemLike } from "./types";

export async function loadOpportunityCorpus(): Promise<OpportunityCorpus> {
  const [blogs, keywords] = await Promise.all([
    prisma.blog.findMany({
      where: { status: BlogStatus.PUBLISHED },
      select: {
        title: true,
        slug: true,
        tags: true,
        metaKeywords: true,
        category: true,
      },
    }),
    prisma.keyword.findMany({
      select: { term: true },
      take: 500,
    }),
  ]);

  const blogKeywords: string[] = [];
  for (const blog of blogs) {
    blogKeywords.push(...blog.tags);
    if (blog.category) blogKeywords.push(blog.category);
    if (blog.metaKeywords) {
      blogKeywords.push(
        ...blog.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean),
      );
    }
  }

  return {
    blogTitles: blogs.map((b) => b.title),
    blogSlugs: blogs.map((b) => b.slug),
    blogKeywords,
    trackedKeywords: keywords.map((k) => k.term),
  };
}

export async function loadResearchItemsForOpportunity(input: {
  limit: number;
  minResearchRelevance: number;
  researchStatuses: Array<"NEW" | "PROCESSED" | "ARCHIVED" | "IGNORED">;
}): Promise<ResearchItemLike[]> {
  return prisma.researchItem.findMany({
    where: {
      status: { in: input.researchStatuses },
      relevanceScore: { gte: input.minResearchRelevance },
    },
    orderBy: [{ relevanceScore: "desc" }, { publishedAt: "desc" }],
    take: input.limit,
  });
}
