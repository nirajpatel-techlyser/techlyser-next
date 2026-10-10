import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SocialPublishError } from "@/social/errors";
import { downloadImageOnce } from "@/social/image";
import { attemptKey, jobKey, planPublishingActions } from "@/social/idempotency";
import { publisherFor } from "@/social/publishers";
import { rollupAttemptStatus } from "@/social/status";
import {
  captionForStoredVariant,
  loadPublisherAccount,
  loadWebsitePost,
} from "@/social/store";
import type { SocialPlatform } from "@/social/types";
import { evaluatePublish } from "@/social/validate";

function uniqueConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function ensureDistribution(blogId: string) {
  return prisma.socialDistribution.upsert({
    where: { blogId },
    update: {},
    create: { blogId, status: "NEEDS_REVIEW" },
    select: { id: true, approvedAt: true },
  });
}

async function saveVariants(
  distributionId: string,
  post: NonNullable<Awaited<ReturnType<typeof loadWebsitePost>>>,
  platforms: SocialPlatform[],
) {
  const saved = [];
  for (const platform of platforms) {
    const caption = captionForStoredVariant(post, platform);
    const existing = await prisma.socialVariant.findUnique({
      where: { distributionId_platform: { distributionId, platform } },
      select: { id: true, sourceHash: true, caption: true, hashtags: true },
    });
    const nextCaption =
      existing && existing.sourceHash === caption.sourceHash
        ? existing.caption
        : caption.caption;
    const nextTags =
      existing && existing.sourceHash === caption.sourceHash
        ? existing.hashtags
        : caption.hashtags;
    const contentHash = caption.contentHash;
    const row = existing
      ? await prisma.socialVariant.update({
          where: { id: existing.id },
          data: {
            caption: nextCaption,
            hashtags: nextTags,
            linkUrl: caption.linkUrl,
            imageUrl: caption.imageUrl,
            sourceHash: caption.sourceHash,
            contentHash,
          },
          select: { platform: true, contentHash: true },
        })
      : await prisma.socialVariant.create({
          data: {
            distributionId,
            platform,
            caption: nextCaption,
            hashtags: nextTags,
            linkUrl: caption.linkUrl,
            imageUrl: caption.imageUrl,
            sourceHash: caption.sourceHash,
            contentHash,
          },
          select: { platform: true, contentHash: true },
        });
    saved.push(row);
  }
  return saved;
}

export async function startPublishJob(input: {
  blogId: string;
  platforms: SocialPlatform[];
}) {
  const post = await loadWebsitePost(input.blogId);
  if (!post) return { error: "Post not found.", status: 404 as const };
  const accounts = await prisma.socialAccount.findMany({
    where: { status: "CONNECTED", platform: { in: input.platforms } },
    select: { platform: true },
    take: 8,
  });
  const distribution = await ensureDistribution(input.blogId);
  const gate = evaluatePublish({
    websitePublished: post.websiteStatus === "PUBLISHED",
    approved: Boolean(distribution.approvedAt),
    hasContent: Boolean(post.title.trim() && post.content.trim()),
    featuredImage: post.featuredImage,
    selected: input.platforms,
    connected: accounts.map((account) => account.platform),
  });
  if (!gate.ok) {
    return { error: gate.reasons[0] || "This post is not ready to publish.", status: 400 as const };
  }

  const variants = await saveVariants(distribution.id, post, input.platforms);
  const keys = variants.map((variant) =>
    attemptKey(input.blogId, variant.platform, variant.contentHash),
  );
  const priors = await prisma.socialPublishAttempt.findMany({
    where: { idempotencyKey: { in: keys } },
    select: { platform: true, status: true, contentHash: true, jobId: true },
  });
  const actions = planPublishingActions(priors, variants);
  const publishable = actions.filter((action) => action.action === "publish");
  if (publishable.length === 0) {
    const existingId = priors[0]?.jobId;
    const running = await prisma.socialPublishJob.findFirst({
      where: { blogId: input.blogId, status: { in: ["QUEUED", "RUNNING"] } },
      select: { id: true },
    });
    return { jobId: running?.id || existingId || null, created: false, status: 200 as const };
  }

  const idempotencyKey = jobKey(
    input.blogId,
    publishable.map((item) => item.platform),
    publishable.map((item) => item.contentHash),
  );
  const existingJob = await prisma.socialPublishJob.findUnique({
    where: { idempotencyKey },
    select: { id: true },
  });
  if (existingJob) return { jobId: existingJob.id, created: false, status: 200 as const };

  try {
    const job = await prisma.socialPublishJob.create({
      data: {
        distributionId: distribution.id,
        blogId: input.blogId,
        idempotencyKey,
        platforms: publishable.map((item) => item.platform),
        status: "QUEUED",
        attempts: {
          create: publishable.map((item) => ({
            blogId: input.blogId,
            platform: item.platform,
            contentHash: item.contentHash,
            idempotencyKey: attemptKey(input.blogId, item.platform, item.contentHash),
            status: "PENDING",
          })),
        },
      },
      select: { id: true },
    });
    await prisma.socialDistribution.update({
      where: { id: distribution.id },
      data: { status: "PUBLISHING" },
    });
    return { jobId: job.id, created: true, status: 202 as const };
  } catch (error) {
    if (!uniqueConflict(error)) throw error;
    const raced = await prisma.socialPublishJob.findUnique({
      where: { idempotencyKey },
      select: { id: true },
    });
    return { jobId: raced?.id || null, created: false, status: 200 as const };
  }
}

async function finishJob(jobId: string, blogId: string) {
  const attempts = await prisma.socialPublishAttempt.findMany({
    where: { jobId },
    select: { status: true },
  });
  const lifecycle = rollupAttemptStatus(attempts.map((attempt) => attempt.status));
  const jobStatus =
    lifecycle === "PUBLISHING"
      ? "RUNNING"
      : lifecycle === "PUBLISH_FAILED"
        ? "FAILED"
        : "COMPLETED";
  await prisma.$transaction([
    prisma.socialPublishJob.update({
      where: { id: jobId },
      data: {
        status: jobStatus,
        completedAt: jobStatus === "RUNNING" ? null : new Date(),
      },
    }),
    prisma.socialDistribution.update({
      where: { blogId },
      data: { status: lifecycle },
    }),
  ]);
}

async function runOneAttempt(input: {
  attemptId: string;
  blogId: string;
  platform: SocialPlatform;
  image: Awaited<ReturnType<typeof downloadImageOnce>>;
}) {
  const claimed = await prisma.socialPublishAttempt.updateMany({
    where: { id: input.attemptId, status: { in: ["PENDING", "FAILED"] } },
    data: { status: "PUBLISHING", attemptCount: { increment: 1 }, errorMessage: null, errorDetail: null },
  });
  if (claimed.count === 0) return;

  const variant = await prisma.socialVariant.findFirst({
    where: { distribution: { blogId: input.blogId }, platform: input.platform },
    select: {
      platform: true,
      caption: true,
      hashtags: true,
      linkUrl: true,
      imageUrl: true,
      sourceHash: true,
      contentHash: true,
    },
  });
  const account = await loadPublisherAccount(input.platform);
  if (!variant || !account) {
    await prisma.socialPublishAttempt.update({
      where: { id: input.attemptId },
      data: {
        status: "FAILED",
        retryable: false,
        errorCode: "DISCONNECTED",
        errorMessage: `Reconnect ${input.platform === "GOOGLE_BUSINESS" ? "Google Business Profile" : input.platform.toLowerCase()} before retrying.`,
      },
    });
    return;
  }

  const publisher = publisherFor(input.platform);
  const problem = publisher.validate(variant);
  if (problem) {
    await prisma.socialPublishAttempt.update({
      where: { id: input.attemptId },
      data: {
        status: "FAILED",
        retryable: false,
        errorCode: "INVALID_CONTENT",
        errorMessage: problem,
      },
    });
    return;
  }

  try {
    const result = await publisher.publish({
      caption: variant,
      account,
      image: input.image,
    });
    await prisma.socialPublishAttempt.update({
      where: { id: input.attemptId },
      data: {
        status: "PUBLISHED",
        retryable: false,
        externalPostId: result.externalPostId,
        publishedUrl: result.publishedUrl,
        errorCode: null,
        errorMessage: null,
        errorDetail: null,
      },
    });
  } catch (error) {
    const mapped =
      error instanceof SocialPublishError
        ? error
        : new SocialPublishError("UNKNOWN", "Publishing failed.", "");
    if (mapped.code === "AUTH") {
      await prisma.socialAccount.updateMany({
        where: { id: account.id },
        data: { status: "EXPIRED" },
      });
    }
    console.error("[social] publish failed", {
      platform: input.platform,
      code: mapped.code,
    });
    await prisma.socialPublishAttempt.update({
      where: { id: input.attemptId },
      data: {
        status: "FAILED",
        retryable: mapped.retryable,
        errorCode: mapped.code,
        errorMessage: mapped.message,
        errorDetail: mapped.detail,
      },
    });
  }
}

export async function runSocialJob(jobId: string) {
  const claimed = await prisma.socialPublishJob.updateMany({
    where: { id: jobId, status: "QUEUED" },
    data: { status: "RUNNING", startedAt: new Date() },
  });
  if (claimed.count === 0) return;

  const job = await prisma.socialPublishJob.findUnique({
    where: { id: jobId },
    select: {
      blogId: true,
      attempts: {
        where: { status: "PENDING" },
        select: { id: true, platform: true },
      },
    },
  });
  if (!job) return;

  const needsImage = job.attempts.some((attempt) => attempt.platform === "LINKEDIN");
  let image: Awaited<ReturnType<typeof downloadImageOnce>> = null;
  if (needsImage) {
    const variant = await prisma.socialVariant.findFirst({
      where: { distribution: { blogId: job.blogId }, platform: "LINKEDIN" },
      select: { imageUrl: true },
    });
    try {
      image = await downloadImageOnce(variant?.imageUrl ?? null);
    } catch (error) {
      const message =
        error instanceof SocialPublishError
          ? error.message
          : "The featured image could not be downloaded.";
      await prisma.socialPublishAttempt.updateMany({
        where: { jobId, platform: "LINKEDIN", status: "PENDING" },
        data: {
          status: "FAILED",
          retryable: false,
          errorCode: "INVALID_IMAGE",
          errorMessage: message,
        },
      });
    }
  }

  for (const attempt of job.attempts) {
    if (attempt.platform === "LINKEDIN" && image === null && needsImage) {
      const failed = await prisma.socialPublishAttempt.findUnique({
        where: { id: attempt.id },
        select: { status: true },
      });
      if (failed?.status === "FAILED") continue;
    }
    await runOneAttempt({
      attemptId: attempt.id,
      blogId: job.blogId,
      platform: attempt.platform,
      image,
    });
  }
  await finishJob(jobId, job.blogId);
}

export async function retrySocialAttempt(attemptId: string) {
  const attempt = await prisma.socialPublishAttempt.findUnique({
    where: { id: attemptId },
    select: { id: true, status: true, platform: true, blogId: true, jobId: true, publishedUrl: true },
  });
  if (!attempt) return { error: "Publish attempt not found.", status: 404 as const };
  if (attempt.status === "PUBLISHED" || attempt.status === "SKIPPED") {
    return { jobId: attempt.jobId, created: false, status: 200 as const };
  }
  if (attempt.status === "PUBLISHING") {
    return { jobId: attempt.jobId, created: false, status: 200 as const };
  }
  const variant = await prisma.socialVariant.findFirst({
    where: { distribution: { blogId: attempt.blogId }, platform: attempt.platform },
    select: { imageUrl: true },
  });
  let image: Awaited<ReturnType<typeof downloadImageOnce>> = null;
  if (attempt.platform === "LINKEDIN") {
    try {
      image = await downloadImageOnce(variant?.imageUrl ?? null);
    } catch (error) {
      const message =
        error instanceof SocialPublishError
          ? error.message
          : "The featured image could not be downloaded.";
      await prisma.socialPublishAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "FAILED",
          retryable: false,
          errorCode: "INVALID_IMAGE",
          errorMessage: message,
        },
      });
      await finishJob(attempt.jobId, attempt.blogId);
      return { jobId: attempt.jobId, created: false, status: 200 as const };
    }
  }
  await runOneAttempt({
    attemptId: attempt.id,
    blogId: attempt.blogId,
    platform: attempt.platform,
    image,
  });
  await finishJob(attempt.jobId, attempt.blogId);
  return { jobId: attempt.jobId, created: false, status: 200 as const };
}

export async function readJobStatus(jobId: string) {
  return prisma.socialPublishJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      blogId: true,
      attempts: {
        select: {
          id: true,
          platform: true,
          status: true,
          publishedUrl: true,
          errorMessage: true,
          retryable: true,
          externalPostId: true,
        },
      },
      distribution: { select: { status: true } },
    },
  });
}
