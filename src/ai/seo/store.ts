import { BlogStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SeoOptimizeOutput } from "./types";
import type { GeoOptimizeOutput } from "@/ai/geo/types";

export async function loadBlogForSeo(blogId: string) {
  return prisma.blog.findUnique({
    where: { id: blogId },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      category: true,
      tags: true,
      featuredImage: true,
      seoTitle: true,
      seoDescription: true,
      metaKeywords: true,
      status: true,
      publishedAt: true,
    },
  });
}

export async function createSeoGeoRun(input: {
  blogId?: string;
  primaryKeyword: string;
  apply: boolean;
}) {
  return prisma.aiSeoGeoRun.create({
    data: {
      status: "RUNNING",
      blogId: input.blogId || null,
      input: {
        primaryKeyword: input.primaryKeyword,
        apply: input.apply,
        blogId: input.blogId || null,
      },
      startedAt: new Date(),
    },
  });
}

export async function completeSeoGeoRun(input: {
  runId: string;
  seo: SeoOptimizeOutput;
  geo: GeoOptimizeOutput;
  applied: boolean;
  blogId?: string;
}) {
  return prisma.aiSeoGeoRun.update({
    where: { id: input.runId },
    data: {
      status: "COMPLETED",
      applied: input.applied,
      seoScore: input.seo.score,
      geoScore: input.geo.score,
      seoOutput: input.seo as unknown as Prisma.InputJsonValue,
      geoOutput: input.geo as unknown as Prisma.InputJsonValue,
      blogId: input.blogId || null,
      completedAt: new Date(),
    },
  });
}

export async function failSeoGeoRun(runId: string, errorMessage: string) {
  return prisma.aiSeoGeoRun.update({
    where: { id: runId },
    data: {
      status: "FAILED",
      errorMessage,
      completedAt: new Date(),
    },
  });
}

/**
 * Apply SEO fields to Blog. Never changes status to PUBLISHED.
 * Draft stays draft; published stays published (metadata refresh only).
 */
export async function applySeoGeoToBlog(input: {
  blogId: string;
  seo: SeoOptimizeOutput;
  geo: GeoOptimizeOutput;
}) {
  const blog = await prisma.blog.findUnique({ where: { id: input.blogId } });
  if (!blog) throw new Error("Blog not found for apply");

  return prisma.blog.update({
    where: { id: input.blogId },
    data: {
      seoTitle: input.seo.metadata.seoTitle,
      seoDescription: input.seo.metadata.seoDescription,
      metaKeywords: input.seo.metadata.metaKeywords.join(", "),
      excerpt: input.seo.metadata.seoDescription,
      content: input.seo.optimizedContent,
      readingTime: Math.max(
        1,
        Math.ceil(
          input.seo.optimizedContent
            .replace(/<[^>]+>/g, " ")
            .trim()
            .split(/\s+/)
            .filter(Boolean).length / 200,
        ),
      ),
      // Explicit: never flip to published via SEO engine
      status: blog.status === BlogStatus.PUBLISHED ? BlogStatus.PUBLISHED : BlogStatus.DRAFT,
    },
  });
}

export async function listSeoGeoRuns(limit = 30) {
  return prisma.aiSeoGeoRun.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      blog: { select: { id: true, slug: true, title: true, status: true } },
    },
  });
}

export async function getSeoGeoRun(id: string) {
  return prisma.aiSeoGeoRun.findUnique({
    where: { id },
    include: {
      blog: { select: { id: true, slug: true, title: true, status: true } },
    },
  });
}

export async function listBlogsForSeo(limit = 40) {
  return prisma.blog.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      category: true,
      metaKeywords: true,
      updatedAt: true,
    },
  });
}
