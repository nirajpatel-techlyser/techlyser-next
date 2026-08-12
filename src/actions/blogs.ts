"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BlogStatus } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const blogSchema = z.object({
  title: z.string().min(3),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  featuredImage: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  author: z.string().default("Techlyser Web Solutions"),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  linkedinPersonalPost: z.string().optional().nullable(),
  linkedinPagePost: z.string().optional().nullable(),
  status: z.nativeEnum(BlogStatus),
  featured: z.boolean().default(false),
  commentsEnabled: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
});

export type BlogInput = z.infer<typeof blogSchema>;

function readingTimeMinutes(content: string): number {
  const words = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean)
    .length;
  return Math.max(1, Math.ceil(words / 200));
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createBlog(raw: BlogInput) {
  await requireAdmin();
  const data = blogSchema.parse(raw);

  const existing = await prisma.blog.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return { success: false as const, error: "Slug already exists." };
  }

  const publishedAt =
    data.status === BlogStatus.PUBLISHED
      ? data.publishedAt
        ? new Date(data.publishedAt)
        : new Date()
      : data.publishedAt
        ? new Date(data.publishedAt)
        : null;

  const blog = await prisma.blog.create({
    data: {
      ...data,
      featuredImage: data.featuredImage || null,
      category: data.category || null,
      seoTitle: data.seoTitle || data.title,
      seoDescription: data.seoDescription || data.excerpt || null,
      metaKeywords: data.metaKeywords || null,
      linkedinPersonalPost: data.linkedinPersonalPost || null,
      linkedinPagePost: data.linkedinPagePost || null,
      readingTime: readingTimeMinutes(data.content),
      publishedAt,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/${blog.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/blogs");

  return { success: true as const, id: blog.id };
}

export async function updateBlog(id: string, raw: BlogInput) {
  await requireAdmin();
  const data = blogSchema.parse(raw);

  const conflict = await prisma.blog.findFirst({
    where: { slug: data.slug, NOT: { id } },
  });
  if (conflict) {
    return { success: false as const, error: "Slug already exists." };
  }

  const current = await prisma.blog.findUnique({ where: { id } });
  if (!current) {
    return { success: false as const, error: "Blog not found." };
  }

  let publishedAt = current.publishedAt;
  if (data.status === BlogStatus.PUBLISHED) {
    publishedAt = data.publishedAt
      ? new Date(data.publishedAt)
      : current.publishedAt ?? new Date();
  }

  const blog = await prisma.blog.update({
    where: { id },
    data: {
      ...data,
      featuredImage: data.featuredImage || null,
      category: data.category || null,
      seoTitle: data.seoTitle || data.title,
      seoDescription: data.seoDescription || data.excerpt || null,
      metaKeywords: data.metaKeywords || null,
      linkedinPersonalPost: data.linkedinPersonalPost || null,
      linkedinPagePost: data.linkedinPagePost || null,
      readingTime: readingTimeMinutes(data.content),
      publishedAt,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/${blog.slug}`);
  if (current.slug !== blog.slug) {
    revalidatePath(`/${current.slug}`);
  }
  revalidatePath("/admin");
  revalidatePath("/admin/blogs");
  revalidatePath(`/admin/blogs/${id}/edit`);

  return { success: true as const, id: blog.id };
}

export async function deleteBlog(id: string) {
  await requireAdmin();
  const blog = await prisma.blog.delete({ where: { id } });
  revalidatePath("/blog");
  revalidatePath(`/${blog.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/blogs");
  return { success: true as const };
}

export async function duplicateBlog(id: string) {
  await requireAdmin();
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) {
    return { success: false as const, error: "Blog not found." };
  }

  const baseSlug = `${blog.slug}-copy`;
  let slug = baseSlug;
  let i = 1;
  while (await prisma.blog.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const copy = await prisma.blog.create({
    data: {
      title: `${blog.title} (Copy)`,
      slug,
      excerpt: blog.excerpt,
      content: blog.content,
      featuredImage: blog.featuredImage,
      category: blog.category,
      tags: blog.tags,
      author: blog.author,
      seoTitle: blog.seoTitle,
      seoDescription: blog.seoDescription,
      metaKeywords: blog.metaKeywords,
      linkedinPersonalPost: blog.linkedinPersonalPost,
      linkedinPagePost: blog.linkedinPagePost,
      status: BlogStatus.DRAFT,
      featured: false,
      readingTime: blog.readingTime,
      publishedAt: null,
    },
  });

  revalidatePath("/admin/blogs");
  redirect(`/admin/blogs/${copy.id}/edit`);
}
