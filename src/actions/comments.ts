"use server";

import { revalidatePath } from "next/cache";
import { CommentStatus } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const commentSchema = z.object({
  blogId: z.string().min(1),
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  content: z.string().min(5).max(2000),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

export async function submitComment(raw: z.infer<typeof commentSchema>) {
  const data = commentSchema.parse(raw);

  const blog = await prisma.blog.findFirst({
    where: {
      id: data.blogId,
      status: "PUBLISHED",
      commentsEnabled: true,
    },
    select: { id: true, slug: true },
  });

  if (!blog) {
    return {
      success: false as const,
      error: "Comments are disabled for this post.",
    };
  }

  await prisma.blogComment.create({
    data: {
      blogId: blog.id,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      content: data.content.trim(),
      status: CommentStatus.PENDING,
    },
  });

  revalidatePath(`/${blog.slug}`);
  revalidatePath("/admin/comments");

  return { success: true as const };
}

export async function updateCommentStatus(
  id: string,
  status: CommentStatus,
) {
  await requireAdmin();

  const comment = await prisma.blogComment.update({
    where: { id },
    data: { status },
    include: { blog: { select: { slug: true } } },
  });

  revalidatePath(`/${comment.blog.slug}`);
  revalidatePath("/admin/comments");
  revalidatePath("/admin");

  return { success: true as const };
}

export async function deleteComment(id: string) {
  await requireAdmin();

  const comment = await prisma.blogComment.delete({
    where: { id },
    include: { blog: { select: { slug: true } } },
  });

  revalidatePath(`/${comment.blog.slug}`);
  revalidatePath("/admin/comments");
  revalidatePath("/admin");

  return { success: true as const };
}
