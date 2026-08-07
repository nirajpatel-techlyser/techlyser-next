import { BlogStatus, type Blog } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugifyTaxonomy } from "@/lib/blog-html";
import type { BlogPost } from "@/types/blog";

function mapBlog(blog: Blog): BlogPost {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    description: blog.seoDescription || blog.excerpt || "",
    excerpt: blog.excerpt || "",
    date: (blog.publishedAt || blog.createdAt).toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    author: blog.author,
    categories: blog.category ? [blog.category] : [],
    tags: blog.tags,
    coverImage: blog.featuredImage || "",
    featured: blog.featured,
    commentsEnabled: blog.commentsEnabled,
    content: blog.content,
    readingTime: blog.readingTime ? `${blog.readingTime} min read` : undefined,
    readingTimeMinutes: blog.readingTime || undefined,
    seoTitle: blog.seoTitle || undefined,
    seoDescription: blog.seoDescription || undefined,
    metaKeywords: blog.metaKeywords || undefined,
    views: blog.views,
    status: blog.status,
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return posts.map(mapBlog);
}

export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const post = await prisma.blog.findFirst({
    where: {
      slug,
      status: BlogStatus.PUBLISHED,
    },
  });

  if (!post) {
    throw new Error(`Post not found for slug: ${slug}`);
  }

  return mapBlog(post);
}

export async function getRelatedPosts(
  slug: string,
  category?: string,
  limit = 3,
): Promise<BlogPost[]> {
  const posts = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      slug: { not: slug },
      ...(category ? { category } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  if (posts.length >= limit || !category) {
    return posts.map(mapBlog);
  }

  const filler = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      slug: { notIn: [slug, ...posts.map((p) => p.slug)] },
    },
    orderBy: { publishedAt: "desc" },
    take: limit - posts.length,
  });

  return [...posts, ...filler].map(mapBlog);
}

export async function getAdjacentPosts(slug: string) {
  const posts = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: { slug: true, title: true },
  });

  const index = posts.findIndex((post) => post.slug === slug);
  return {
    previous: index > 0 ? posts[index - 1] : null,
    next: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null,
  };
}

export async function incrementPostViews(slug: string) {
  await prisma.blog.updateMany({
    where: { slug, status: BlogStatus.PUBLISHED },
    data: { views: { increment: 1 } },
  });
}

export async function getAllCategories(): Promise<
  { name: string; slug: string; count: number }[]
> {
  const rows = await prisma.blog.groupBy({
    by: ["category"],
    where: {
      status: BlogStatus.PUBLISHED,
      category: { not: null },
    },
    _count: { _all: true },
    orderBy: { _count: { category: "desc" } },
  });

  return rows
    .filter((row) => row.category)
    .map((row) => ({
      name: row.category as string,
      slug: slugifyTaxonomy(row.category as string),
      count: row._count._all,
    }));
}

export async function getPostsByCategory(
  categorySlug: string,
): Promise<{ category: string; posts: BlogPost[] } | null> {
  const categories = await getAllCategories();
  const match = categories.find((item) => item.slug === categorySlug);
  if (!match) return null;

  const posts = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED, category: match.name },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return { category: match.name, posts: posts.map(mapBlog) };
}

export async function getAllTags(): Promise<
  { name: string; slug: string; count: number }[]
> {
  const posts = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED },
    select: { tags: true },
  });

  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      const key = tag.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      slug: slugifyTaxonomy(name),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getPostsByTag(
  tagSlug: string,
): Promise<{ tag: string; posts: BlogPost[] } | null> {
  const tags = await getAllTags();
  const match = tags.find((item) => item.slug === tagSlug);
  if (!match) return null;

  const posts = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      tags: { has: match.name },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return { tag: match.name, posts: posts.map(mapBlog) };
}
