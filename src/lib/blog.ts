import { BlogStatus, type Blog } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BlogPost } from "@/types/blog";

function mapBlog(blog: Blog): BlogPost {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    description: blog.seoDescription || blog.excerpt || "",
    excerpt: blog.excerpt || "",
    date: (blog.publishedAt || blog.createdAt).toISOString(),
    author: blog.author,
    categories: blog.category ? [blog.category] : [],
    tags: blog.tags,
    coverImage: blog.featuredImage || "",
    featured: blog.featured,
    commentsEnabled: blog.commentsEnabled,
    content: blog.content,
    readingTime: blog.readingTime ? `${blog.readingTime} min read` : undefined,
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

  return posts.map(mapBlog);
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
