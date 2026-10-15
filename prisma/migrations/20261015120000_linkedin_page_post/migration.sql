ALTER TABLE "SocialPublishAttempt" ADD COLUMN IF NOT EXISTS "secondaryExternalPostId" TEXT;
ALTER TABLE "SocialPublishAttempt" ADD COLUMN IF NOT EXISTS "secondaryPublishedUrl" TEXT;
