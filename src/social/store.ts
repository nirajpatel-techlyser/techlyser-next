import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildSocialCaption, buildSocialCaptions } from "@/social/content";
import { decryptSecret, encryptSecret } from "@/social/crypto";
import { imageRequired, PLATFORM_LABEL } from "@/social/labels";
import { lifecycleBeforePublish } from "@/social/status";
import type { SocialPlatform, SocialPublishView, WebsitePostSource } from "@/social/types";
import { evaluatePublish } from "@/social/validate";

const accountPublicSelect = {
  id: true,
  platform: true,
  label: true,
  status: true,
  expiresAt: true,
} as const;

export async function loadWebsitePost(blogId: string): Promise<WebsitePostSource | null> {
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      featuredImage: true,
      tags: true,
      linkedinPersonalPost: true,
      linkedinPagePost: true,
      status: true,
    },
  });
  if (!blog) return null;
  return {
    blogId: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt || "",
    content: blog.content,
    featuredImage: blog.featuredImage,
    tags: blog.tags,
    linkedinPersonalPost: blog.linkedinPersonalPost || "",
    linkedinPagePost: blog.linkedinPagePost || "",
    websiteStatus: blog.status,
  };
}

export async function upsertSocialAccount(input: {
  platform: SocialPlatform;
  label: string;
  externalAccountId: string;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  scopes?: string | null;
  metadata?: Prisma.InputJsonValue | null;
  connectedByUserId?: string | null;
}) {
  const accessTokenEnc = encryptSecret(input.accessToken);
  const refreshTokenEnc = input.refreshToken ? encryptSecret(input.refreshToken) : undefined;
  const existing = await prisma.socialAccount.findUnique({
    where: {
      platform_externalAccountId: {
        platform: input.platform,
        externalAccountId: input.externalAccountId,
      },
    },
    select: { id: true, refreshTokenEnc: true },
  });
  const data = {
    label: input.label,
    status: "CONNECTED" as const,
    accessTokenEnc,
    refreshTokenEnc: refreshTokenEnc ?? existing?.refreshTokenEnc ?? null,
    expiresAt: input.expiresAt ?? null,
    scopes: input.scopes ?? null,
    metadata: input.metadata ?? undefined,
    connectedByUserId: input.connectedByUserId ?? null,
  };
  if (existing) {
    await prisma.socialAccount.update({ where: { id: existing.id }, data });
    return existing.id;
  }
  const created = await prisma.socialAccount.create({
    data: {
      ...data,
      platform: input.platform,
      externalAccountId: input.externalAccountId,
    },
    select: { id: true },
  });
  return created.id;
}

export async function listPublicAccounts() {
  return prisma.socialAccount.findMany({
    where: { status: { in: ["CONNECTED", "EXPIRED", "ERROR", "REVOKED"] } },
    select: accountPublicSelect,
    orderBy: { platform: "asc" },
    take: 12,
  });
}

export async function disconnectAccount(id: string) {
  await prisma.socialAccount.delete({ where: { id } });
}

export async function loadPublisherAccount(platform: SocialPlatform) {
  const account = await prisma.socialAccount.findFirst({
    where: { platform, status: "CONNECTED" },
    select: {
      id: true,
      platform: true,
      label: true,
      externalAccountId: true,
      accessTokenEnc: true,
      refreshTokenEnc: true,
      expiresAt: true,
      metadata: true,
    },
  });
  if (!account) return null;
  return {
    id: account.id,
    platform: account.platform,
    label: account.label,
    externalAccountId: account.externalAccountId,
    accessToken: decryptSecret(account.accessTokenEnc),
    refreshToken: account.refreshTokenEnc ? decryptSecret(account.refreshTokenEnc) : null,
    expiresAt: account.expiresAt,
    metadata: (account.metadata as Record<string, unknown> | null) ?? null,
  };
}

export async function composeSocialPublishView(post: WebsitePostSource): Promise<SocialPublishView> {
  const [accounts, distribution, attempts, activeJob] = await Promise.all([
    prisma.socialAccount.findMany({
      where: { status: "CONNECTED" },
      select: { platform: true, label: true },
      take: 8,
    }),
    prisma.socialDistribution.findUnique({
      where: { blogId: post.blogId },
      select: {
        status: true,
        approvedAt: true,
        variants: {
          select: {
            platform: true,
            caption: true,
            hashtags: true,
            linkUrl: true,
            imageUrl: true,
            sourceHash: true,
          },
        },
      },
    }),
    prisma.socialPublishAttempt.findMany({
      where: { blogId: post.blogId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        platform: true,
        status: true,
        publishedUrl: true,
        secondaryPublishedUrl: true,
        errorMessage: true,
        retryable: true,
        contentHash: true,
        externalPostId: true,
      },
    }),
    prisma.socialPublishJob.findFirst({
      where: { blogId: post.blogId, status: { in: ["QUEUED", "RUNNING"] } },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const latestAttempts = new Map<string, (typeof attempts)[number]>();
  for (const attempt of attempts) {
    if (!latestAttempts.has(attempt.platform)) latestAttempts.set(attempt.platform, attempt);
  }
  const connected = accounts.map((account) => account.platform);
  const fresh = buildSocialCaptions(post);
  const gate = evaluatePublish({
    websitePublished: post.websiteStatus === "PUBLISHED",
    approved: Boolean(distribution?.approvedAt),
    hasContent: Boolean(post.title.trim() && post.content.trim()),
    featuredImage: post.featuredImage,
    selected: connected,
    connected,
  });
  const terminal = new Set([
    "PUBLISHING",
    "PARTIALLY_PUBLISHED",
    "PUBLISHED",
    "PUBLISH_FAILED",
    "CANCELLED",
  ]);
  const lifecycle = distribution && terminal.has(distribution.status)
    ? distribution.status
    : lifecycleBeforePublish({
        approved: Boolean(distribution?.approvedAt),
        ready: gate.ok,
      });

  return {
    blogId: post.blogId,
    lifecycle,
    approved: Boolean(distribution?.approvedAt),
    websitePublished: post.websiteStatus === "PUBLISHED",
    featuredImage: post.featuredImage,
    canPublish: gate.ok,
    reasons: gate.reasons,
    activeJobId: activeJob?.id ?? null,
    platforms: fresh.map((caption) => {
      const stored = distribution?.variants.find((variant) => variant.platform === caption.platform);
      const useStored = stored && stored.sourceHash === caption.sourceHash;
      const account = accounts.find((row) => row.platform === caption.platform);
      const attempt = latestAttempts.get(caption.platform) ?? null;
      const platformGate = evaluatePublish({
        websitePublished: post.websiteStatus === "PUBLISHED",
        approved: Boolean(distribution?.approvedAt),
        hasContent: Boolean(post.title.trim() && post.content.trim()),
        featuredImage: post.featuredImage,
        selected: [caption.platform],
        connected,
      });
      return {
        platform: caption.platform,
        label: PLATFORM_LABEL[caption.platform],
        caption: useStored ? stored.caption : caption.caption,
        hashtags: useStored ? stored.hashtags : caption.hashtags,
        linkUrl: caption.linkUrl,
        imageUrl: caption.imageUrl,
        imageRequired: imageRequired(caption.platform),
        connected: Boolean(account),
        accountLabel: account?.label ?? null,
        blockReason: platformGate.reasons.find((reason) => reason.includes(PLATFORM_LABEL[caption.platform])) ?? null,
        attempt,
      };
    }),
  };
}

export async function loadSocialPublishView(blogId: string) {
  const post = await loadWebsitePost(blogId);
  if (!post) return null;
  return composeSocialPublishView(post);
}

export function captionForStoredVariant(post: WebsitePostSource, platform: SocialPlatform) {
  return buildSocialCaption(post, platform);
}
