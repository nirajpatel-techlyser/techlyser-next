import { BlogStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { WriterInput, WriterOutput } from "./types";
import { articleHtmlLooksLikeEmbeddedJson } from "./llm/coerce-body";

export async function createWriterRun(input: WriterInput) {
  return prisma.aiWriterRun.create({
    data: {
      status: "RUNNING",
      keyword: input.keyword,
      input: input as object,
      contentIdeaId: input.contentIdeaId || null,
      startedAt: new Date(),
    },
  });
}

async function resolveUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${baseSlug}-${suffix}`.slice(0, 80);
    suffix += 1;
  }
}

export async function saveWriterDraftBlog(input: {
  input: WriterInput;
  output: WriterOutput;
  runId: string;
}): Promise<{ slug: string; blogId: string }> {
  if (articleHtmlLooksLikeEmbeddedJson(input.output.articleHtml)) {
    throw new Error(
      "Refusing to save blog: article HTML still contains embedded LLM JSON payload",
    );
  }

  const slug = await resolveUniqueSlug(input.output.slug);

  const blog = await prisma.$transaction(async (tx) => {
    const created = await tx.blog.create({
      data: {
        title: input.output.seoTitle,
        slug,
        excerpt: input.output.excerpt,
        content: input.output.articleHtml,
        category: input.input.category,
        tags: input.output.tags,
        seoTitle: input.output.seoTitle,
        seoDescription: input.output.metaDescription,
        metaKeywords: input.input.keyword,
        linkedinPersonalPost: input.output.linkedinPersonalPostHtml || null,
        linkedinPagePost: input.output.linkedinPagePostHtml || null,
        status: BlogStatus.DRAFT,
        featured: false,
        commentsEnabled: false,
        readingTime: input.output.readingTimeMinutes,
        publishedAt: null,
        scheduledAt: null,
      },
    });

    await tx.aiWriterRun.update({
      where: { id: input.runId },
      data: { blogId: created.id },
    });

    if (input.input.contentIdeaId) {
      const idea = await tx.contentIdea.findUnique({
        where: { id: input.input.contentIdeaId },
      });
      if (idea) {
        await tx.contentIdea.update({
          where: { id: input.input.contentIdeaId },
          data: {
            blogId: created.id,
            slug,
            outline: input.output.outline,
            status: "DRAFT",
            metadata: JSON.parse(
              JSON.stringify({
                writerRunId: input.runId,
                featuredImagePrompt: input.output.featuredImagePrompt,
                schema: input.output.schema,
                toc: input.output.toc,
                faqs: input.output.faqs,
                howTo: input.output.howTo ?? null,
                comparisonTable: input.output.comparisonTable ?? null,
                cta: input.output.cta,
              }),
            ) as Prisma.InputJsonValue,
          },
        });
      }
    }

    return created;
  });

  return { slug: blog.slug, blogId: blog.id };
}

export async function completeWriterRun(input: {
  runId: string;
  output: WriterOutput;
  model: string;
  promptVersion: string;
  blogId: string;
}) {
  return prisma.aiWriterRun.update({
    where: { id: input.runId },
    data: {
      status: "COMPLETED",
      output: input.output as object,
      model: input.model,
      promptVersion: input.promptVersion,
      blogId: input.blogId,
      completedAt: new Date(),
    },
  });
}

export async function failWriterRun(runId: string, errorMessage: string) {
  return prisma.aiWriterRun.update({
    where: { id: runId },
    data: {
      status: "FAILED",
      errorMessage,
      completedAt: new Date(),
    },
  });
}

export async function listWriterRuns(limit = 30) {
  return prisma.aiWriterRun.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      blog: { select: { id: true, slug: true, title: true, status: true } },
      contentIdea: { select: { id: true, title: true } },
    },
  });
}

export async function getWriterRun(id: string) {
  return prisma.aiWriterRun.findUnique({
    where: { id },
    include: {
      blog: { select: { id: true, slug: true, title: true, status: true } },
      contentIdea: { select: { id: true, title: true } },
    },
  });
}

export async function listDraftContentIdeas(limit = 50) {
  return prisma.contentIdea.findMany({
    where: {
      status: { in: ["DRAFT", "QUEUED", "APPROVED"] },
      blogId: null,
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      angle: true,
      outline: true,
      targetWords: true,
      cluster: { select: { name: true } },
    },
  });
}
