-- Social publishing tables. Additive only. Does not change Blog.status.
-- Prisma (postgres role) bypasses RLS. anon/authenticated get no access.

CREATE TYPE "SocialPlatform" AS ENUM ('LINKEDIN', 'INSTAGRAM', 'FACEBOOK', 'GOOGLE_BUSINESS');
CREATE TYPE "SocialAccountStatus" AS ENUM ('CONNECTED', 'EXPIRED', 'REVOKED', 'ERROR');
CREATE TYPE "SocialLifecycleStatus" AS ENUM (
  'DRAFT',
  'NEEDS_REVIEW',
  'APPROVED',
  'READY_TO_PUBLISH',
  'PUBLISHING',
  'PARTIALLY_PUBLISHED',
  'PUBLISHED',
  'PUBLISH_FAILED',
  'CANCELLED'
);
CREATE TYPE "SocialJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE "SocialAttemptStatus" AS ENUM ('PENDING', 'PUBLISHING', 'PUBLISHED', 'FAILED', 'SKIPPED');

CREATE TABLE "SocialAccount" (
  "id" TEXT NOT NULL,
  "platform" "SocialPlatform" NOT NULL,
  "label" TEXT NOT NULL,
  "externalAccountId" TEXT NOT NULL,
  "status" "SocialAccountStatus" NOT NULL DEFAULT 'CONNECTED',
  "accessTokenEnc" TEXT NOT NULL,
  "refreshTokenEnc" TEXT,
  "expiresAt" TIMESTAMP(3),
  "scopes" TEXT,
  "metadata" JSONB,
  "connectedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SocialDistribution" (
  "id" TEXT NOT NULL,
  "blogId" TEXT NOT NULL,
  "status" "SocialLifecycleStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
  "approvedAt" TIMESTAMP(3),
  "approvedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SocialDistribution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SocialVariant" (
  "id" TEXT NOT NULL,
  "distributionId" TEXT NOT NULL,
  "platform" "SocialPlatform" NOT NULL,
  "caption" TEXT NOT NULL,
  "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "linkUrl" TEXT NOT NULL,
  "imageUrl" TEXT,
  "sourceHash" TEXT NOT NULL,
  "contentHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SocialVariant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SocialPublishJob" (
  "id" TEXT NOT NULL,
  "distributionId" TEXT NOT NULL,
  "blogId" TEXT NOT NULL,
  "status" "SocialJobStatus" NOT NULL DEFAULT 'QUEUED',
  "idempotencyKey" TEXT NOT NULL,
  "platforms" "SocialPlatform"[] NOT NULL,
  "scheduledFor" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SocialPublishJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SocialPublishAttempt" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "blogId" TEXT NOT NULL,
  "platform" "SocialPlatform" NOT NULL,
  "status" "SocialAttemptStatus" NOT NULL DEFAULT 'PENDING',
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "retryable" BOOLEAN NOT NULL DEFAULT false,
  "externalPostId" TEXT,
  "publishedUrl" TEXT,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "errorDetail" TEXT,
  "contentHash" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SocialPublishAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SocialAccount_platform_externalAccountId_key" ON "SocialAccount"("platform", "externalAccountId");
CREATE INDEX "SocialAccount_platform_status_idx" ON "SocialAccount"("platform", "status");
CREATE UNIQUE INDEX "SocialDistribution_blogId_key" ON "SocialDistribution"("blogId");
CREATE UNIQUE INDEX "SocialVariant_distributionId_platform_key" ON "SocialVariant"("distributionId", "platform");
CREATE UNIQUE INDEX "SocialPublishJob_idempotencyKey_key" ON "SocialPublishJob"("idempotencyKey");
CREATE INDEX "SocialPublishJob_blogId_createdAt_idx" ON "SocialPublishJob"("blogId", "createdAt");
CREATE INDEX "SocialPublishJob_status_createdAt_idx" ON "SocialPublishJob"("status", "createdAt");
CREATE UNIQUE INDEX "SocialPublishAttempt_idempotencyKey_key" ON "SocialPublishAttempt"("idempotencyKey");
CREATE INDEX "SocialPublishAttempt_blogId_platform_status_idx" ON "SocialPublishAttempt"("blogId", "platform", "status");
CREATE INDEX "SocialPublishAttempt_jobId_idx" ON "SocialPublishAttempt"("jobId");

ALTER TABLE "SocialDistribution" ADD CONSTRAINT "SocialDistribution_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialVariant" ADD CONSTRAINT "SocialVariant_distributionId_fkey" FOREIGN KEY ("distributionId") REFERENCES "SocialDistribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialPublishJob" ADD CONSTRAINT "SocialPublishJob_distributionId_fkey" FOREIGN KEY ("distributionId") REFERENCES "SocialDistribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialPublishJob" ADD CONSTRAINT "SocialPublishJob_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialPublishAttempt" ADD CONSTRAINT "SocialPublishAttempt_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "SocialPublishJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SocialAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SocialDistribution" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SocialVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SocialPublishJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SocialPublishAttempt" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "SocialAccount" FROM anon, authenticated;
REVOKE ALL ON TABLE "SocialDistribution" FROM anon, authenticated;
REVOKE ALL ON TABLE "SocialVariant" FROM anon, authenticated;
REVOKE ALL ON TABLE "SocialPublishJob" FROM anon, authenticated;
REVOKE ALL ON TABLE "SocialPublishAttempt" FROM anon, authenticated;
