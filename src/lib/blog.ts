import { cache } from "react";
import { BlogStatus, type Blog, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugifyTaxonomy } from "@/lib/blog-html";
import type { BlogPost } from "@/types/blog";

/** Card / archive fields — excludes HTML body + LinkedIn drafts (egress). */
const blogListSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  seoDescription: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  author: true,
  category: true,
  tags: true,
  featuredImage: true,
  featured: true,
  commentsEnabled: true,
  readingTime: true,
  seoTitle: true,
  metaKeywords: true,
  views: true,
  status: true,
} satisfies Prisma.BlogSelect;

/** Public article body — still excludes LinkedIn admin fields. */
const blogPublicSelect = {
  ...blogListSelect,
  content: true,
} satisfies Prisma.BlogSelect;

/** Metadata-only (no HTML body). */
const blogMetaSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  seoDescription: true,
  seoTitle: true,
  metaKeywords: true,
  featuredImage: true,
  tags: true,
  author: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BlogSelect;

type BlogListRow = Prisma.BlogGetPayload<{ select: typeof blogListSelect }>;
type BlogPublicRow = Prisma.BlogGetPayload<{ select: typeof blogPublicSelect }>;
type BlogMetaRow = Prisma.BlogGetPayload<{ select: typeof blogMetaSelect }>;

function mapBlogList(blog: BlogListRow): BlogPost {
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
    content: "",
    readingTime: blog.readingTime ? `${blog.readingTime} min read` : undefined,
    readingTimeMinutes: blog.readingTime || undefined,
    seoTitle: blog.seoTitle || undefined,
    seoDescription: blog.seoDescription || undefined,
    metaKeywords: blog.metaKeywords || undefined,
    views: blog.views,
    status: blog.status,
  };
}

function mapBlogPublic(blog: BlogPublicRow): BlogPost {
  return {
    ...mapBlogList(blog),
    content: blog.content,
  };
}

function mapBlogMeta(blog: BlogMetaRow): BlogPost {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    description: blog.seoDescription || blog.excerpt || "",
    excerpt: blog.excerpt || "",
    date: (blog.publishedAt || blog.createdAt).toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    author: blog.author,
    categories: [],
    tags: blog.tags,
    coverImage: blog.featuredImage || "",
    content: "",
    seoTitle: blog.seoTitle || undefined,
    seoDescription: blog.seoDescription || undefined,
    metaKeywords: blog.metaKeywords || undefined,
  };
}

/** Full row mapper (admin / rare). Prefer list/public selects. */
export function mapBlog(blog: Blog): BlogPost {
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

export async function getAllPosts(options?: {
  take?: number;
  skip?: number;
}): Promise<BlogPost[]> {
  const posts = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: blogListSelect,
    ...(options?.take != null ? { take: options.take } : {}),
    ...(options?.skip != null ? { skip: options.skip } : {}),
  });

  return posts.map(mapBlogList);
}

export async function countPublishedPosts(): Promise<number> {
  return prisma.blog.count({ where: { status: BlogStatus.PUBLISHED } });
}

/** Request-deduped public post (body, no LinkedIn). */
export const getPostBySlug = cache(async (slug: string): Promise<BlogPost> => {
  const post = await prisma.blog.findFirst({
    where: {
      slug,
      status: BlogStatus.PUBLISHED,
    },
    select: blogPublicSelect,
  });

  if (!post) {
    throw new Error(`Post not found for slug: ${slug}`);
  }

  return mapBlogPublic(post);
});

/** Metadata-only; shares cache key family via separate cache. */
export const getPostMetaBySlug = cache(async (slug: string): Promise<BlogPost> => {
  const post = await prisma.blog.findFirst({
    where: {
      slug,
      status: BlogStatus.PUBLISHED,
    },
    select: blogMetaSelect,
  });

  if (!post) {
    throw new Error(`Post not found for slug: ${slug}`);
  }

  return mapBlogMeta(post);
});

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
    select: blogListSelect,
  });

  if (posts.length >= limit || !category) {
    return posts.map(mapBlogList);
  }

  const filler = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      slug: { notIn: [slug, ...posts.map((p) => p.slug)] },
    },
    orderBy: { publishedAt: "desc" },
    take: limit - posts.length,
    select: blogListSelect,
  });

  return [...posts, ...filler].map(mapBlogList);
}

/** Prev/next without loading every published slug. */
export async function getAdjacentPosts(slug: string) {
  const current = await prisma.blog.findFirst({
    where: { slug, status: BlogStatus.PUBLISHED },
    select: { publishedAt: true, createdAt: true },
  });

  if (!current) {
    return { previous: null, next: null };
  }

  const publishedAt = current.publishedAt || current.createdAt;

  const [previous, next] = await Promise.all([
    prisma.blog.findFirst({
      where: {
        status: BlogStatus.PUBLISHED,
        slug: { not: slug },
        OR: [
          { publishedAt: { gt: publishedAt } },
          {
            publishedAt,
            createdAt: { gt: current.createdAt },
          },
        ],
      },
      orderBy: [{ publishedAt: "asc" }, { createdAt: "asc" }],
      select: { slug: true, title: true },
    }),
    prisma.blog.findFirst({
      where: {
        status: BlogStatus.PUBLISHED,
        slug: { not: slug },
        OR: [
          { publishedAt: { lt: publishedAt } },
          {
            publishedAt,
            createdAt: { lt: current.createdAt },
          },
          { publishedAt: null, createdAt: { lt: current.createdAt } },
        ],
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { slug: true, title: true },
    }),
  ]);

  return { previous, next };
}

export async function incrementPostViews(slug: string) {
  await prisma.blog.updateMany({
    where: { slug, status: BlogStatus.PUBLISHED },
    data: { views: { increment: 1 } },
  });
}

export const getAllCategories = cache(async (): Promise<
  { name: string; slug: string; count: number }[]
> => {
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
});

export async function getPostsByCategory(
  categorySlug: string,
  options?: { take?: number },
): Promise<{ category: string; posts: BlogPost[] } | null> {
  const categories = await getAllCategories();
  const match = categories.find((item) => item.slug === categorySlug);
  if (!match) return null;

  const posts = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED, category: match.name },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: blogListSelect,
    take: options?.take ?? 100,
  });

  return { category: match.name, posts: posts.map(mapBlogList) };
}

export async function getSitemapEntries(): Promise<
  { slug: string; lastModified: Date }[]
> {
  const posts = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED },
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return posts.map((post) => ({
    slug: post.slug,
    lastModified: post.updatedAt || post.publishedAt || post.createdAt,
  }));
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const categories = await getAllCategories();
  return categories.map((c) => c.slug);
}

export async function getAllTagSlugs(limit = 100): Promise<string[]> {
  const tags = await getAllTags();
  return tags.slice(0, limit).map((tag) => tag.slug);
}

export type BlogTag = {
  name: string;
  slug: string;
  count: number;
  /** Exact tag strings that slugify to this slug (for DB hasSome). */
  variants: string[];
};

export const getAllTags = cache(async (): Promise<BlogTag[]> => {
  const posts = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED },
    select: { tags: true },
  });

  const bySlug = new Map<
    string,
    { name: string; count: number; variants: Set<string> }
  >();
  for (const post of posts) {
    for (const tag of post.tags) {
      const name = tag.trim();
      if (!name) continue;
      const slug = slugifyTaxonomy(name);
      if (!slug) continue;
      const existing = bySlug.get(slug);
      if (existing) {
        existing.count += 1;
        existing.variants.add(name);
      } else {
        bySlug.set(slug, { name, count: 1, variants: new Set([name]) });
      }
    }
  }

  return [...bySlug.entries()]
    .map(([slug, { name, count, variants }]) => ({
      name,
      slug,
      count,
      variants: [...variants],
    }))
    .sort((a, b) => b.count - a.count);
});

export async function getPostsByTag(
  tagSlug: string,
  options?: { take?: number },
): Promise<{ tag: string; posts: BlogPost[] } | null> {
  const tags = await getAllTags();
  const match = tags.find((item) => item.slug === tagSlug);
  if (!match) return null;

  const posts = await prisma.blog.findMany({
    where: {
      status: BlogStatus.PUBLISHED,
      tags: { hasSome: match.variants },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: blogListSelect,
    take: options?.take ?? 100,
  });

  return { tag: match.name, posts: posts.map(mapBlogList) };
}

/** Paginated search against title/excerpt/seo — never loads full corpus. */
export async function searchPublishedPosts(
  query: string,
  options?: { take?: number; skip?: number },
): Promise<{ posts: BlogPost[]; total: number }> {
  const q = query.trim();
  const where = {
    status: BlogStatus.PUBLISHED,
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { excerpt: { contains: q, mode: "insensitive" as const } },
      { seoDescription: { contains: q, mode: "insensitive" as const } },
    ],
  };

  const [total, posts] = await Promise.all([
    prisma.blog.count({ where }),
    prisma.blog.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: blogListSelect,
      take: options?.take ?? 24,
      skip: options?.skip ?? 0,
    }),
  ]);

  return { total, posts: posts.map(mapBlogList) };
}

/** RSS fields only (capped). */
export async function getRssPosts(): Promise<
  { title: string; slug: string; date: string; excerpt: string }[]
> {
  const posts = await prisma.blog.findMany({
    where: { status: BlogStatus.PUBLISHED },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 50,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return posts.map((post) => ({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    date: (post.publishedAt || post.createdAt).toISOString(),
  }));
}
