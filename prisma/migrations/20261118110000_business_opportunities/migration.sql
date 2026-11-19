-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "BizWebsiteStatus" AS ENUM ('NO_WEBSITE_LISTED', 'WEBSITE_VERIFIED_UNAVAILABLE', 'WEBSITE_EXISTS', 'WEBSITE_UNVERIFIED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BizLeadStatus" AS ENUM ('NEW', 'REVIEWING', 'QUALIFIED', 'CONCEPT_READY', 'PROPOSAL_READY', 'AWAITING_APPROVAL', 'CONTACTED', 'NOT_INTERESTED', 'SUPPRESSED', 'DISQUALIFIED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BizJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BizJobStep" AS ENUM ('PENDING', 'DISCOVERING', 'VERIFYING', 'GENERATING_CONTENT', 'RENDERING_WEBSITE', 'CAPTURING_SCREENSHOTS', 'GENERATING_PDF', 'AWAITING_APPROVAL', 'SENDING_EMAIL', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BizConceptStatus" AS ENUM ('DRAFT', 'GENERATING', 'READY', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BizProposalStatus" AS ENUM ('DRAFT', 'GENERATING', 'READY', 'APPROVED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BizOutreachStatus" AS ENUM ('DRAFT', 'AWAITING_APPROVAL', 'APPROVED', 'SENDING', 'SENT', 'FAILED', 'REJECTED', 'SUPPRESSED', 'UNSUBSCRIBED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BizAssetType" AS ENUM ('PHOTO', 'LOGO', 'SCREENSHOT_DESKTOP', 'SCREENSHOT_MOBILE', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "BusinessOpportunityJob" (
  "id" TEXT NOT NULL,
  "status" "BizJobStatus" NOT NULL DEFAULT 'QUEUED',
  "step" "BizJobStep" NOT NULL DEFAULT 'PENDING',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "countryCode" TEXT NOT NULL,
  "countryName" TEXT NOT NULL,
  "cities" TEXT[],
  "categories" TEXT[],
  "radiusKm" INTEGER,
  "resultLimit" INTEGER NOT NULL DEFAULT 25,
  "provider" TEXT NOT NULL DEFAULT 'manual',
  "filters" JSONB,
  "discoveredCount" INTEGER NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  "createdByUserId" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessOpportunityJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BusinessOpportunity" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerRecordId" TEXT,
  "businessName" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "categoryGroup" TEXT,
  "countryCode" TEXT NOT NULL,
  "countryName" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "address" TEXT,
  "phone" TEXT,
  "publicEmail" TEXT,
  "websiteUrl" TEXT,
  "websiteStatus" "BizWebsiteStatus" NOT NULL DEFAULT 'WEBSITE_UNVERIFIED',
  "websiteVerificationEvidence" TEXT,
  "websiteVerifiedAt" TIMESTAMP(3),
  "description" TEXT,
  "openingHours" JSONB,
  "publicServices" JSONB,
  "publicProducts" JSONB,
  "locationData" JSONB,
  "sourceUrl" TEXT,
  "sourceMetadata" JSONB,
  "leadStatus" "BizLeadStatus" NOT NULL DEFAULT 'NEW',
  "notes" TEXT,
  "jobId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessOpportunity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BusinessOpportunityAsset" (
  "id" TEXT NOT NULL,
  "businessOpportunityId" TEXT NOT NULL,
  "assetType" "BizAssetType" NOT NULL DEFAULT 'OTHER',
  "assetUrl" TEXT NOT NULL,
  "sourceUrl" TEXT,
  "usagePermission" TEXT NOT NULL DEFAULT 'unknown',
  "attribution" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessOpportunityAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BusinessWebsiteConcept" (
  "id" TEXT NOT NULL,
  "businessOpportunityId" TEXT NOT NULL,
  "conceptTitle" TEXT NOT NULL,
  "generatedHtml" TEXT NOT NULL,
  "generatedContent" JSONB,
  "previewScreenshotUrl" TEXT,
  "generationStatus" "BizConceptStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessWebsiteConcept_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BusinessProposal" (
  "id" TEXT NOT NULL,
  "businessOpportunityId" TEXT NOT NULL,
  "conceptId" TEXT,
  "pdfStorageKey" TEXT,
  "pdfUrl" TEXT,
  "pdfBase64" TEXT,
  "proposalStatus" "BizProposalStatus" NOT NULL DEFAULT 'DRAFT',
  "generatedAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessProposal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BusinessOutreach" (
  "id" TEXT NOT NULL,
  "businessOpportunityId" TEXT NOT NULL,
  "proposalId" TEXT,
  "recipientEmail" TEXT NOT NULL,
  "senderEmail" TEXT NOT NULL DEFAULT 'info@techlyser.com',
  "subject" TEXT NOT NULL,
  "emailBody" TEXT NOT NULL,
  "approvalStatus" "BizOutreachStatus" NOT NULL DEFAULT 'DRAFT',
  "deliveryStatus" "BizOutreachStatus" NOT NULL DEFAULT 'DRAFT',
  "providerMessageId" TEXT,
  "sentAt" TIMESTAMP(3),
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessOutreach_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BusinessOutreachSuppression" (
  "id" TEXT NOT NULL,
  "email" TEXT,
  "domain" TEXT,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessOutreachSuppression_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BusinessOpportunitySetting" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "favoriteCities" JSONB,
  "customCategories" JSONB,
  "dailyEmailQuota" INTEGER NOT NULL DEFAULT 20,
  "defaultSenderEmail" TEXT NOT NULL DEFAULT 'info@techlyser.com',
  "defaultProvider" TEXT NOT NULL DEFAULT 'manual',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessOpportunitySetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BusinessOpportunity_provider_providerRecordId_key" ON "BusinessOpportunity"("provider", "providerRecordId");
CREATE INDEX IF NOT EXISTS "BusinessOpportunityJob_status_createdAt_idx" ON "BusinessOpportunityJob"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "BusinessOpportunityJob_countryCode_createdAt_idx" ON "BusinessOpportunityJob"("countryCode", "createdAt");
CREATE INDEX IF NOT EXISTS "BusinessOpportunity_leadStatus_createdAt_idx" ON "BusinessOpportunity"("leadStatus", "createdAt");
CREATE INDEX IF NOT EXISTS "BusinessOpportunity_websiteStatus_publicEmail_idx" ON "BusinessOpportunity"("websiteStatus", "publicEmail");
CREATE INDEX IF NOT EXISTS "BusinessOpportunity_countryCode_city_idx" ON "BusinessOpportunity"("countryCode", "city");
CREATE INDEX IF NOT EXISTS "BusinessOpportunity_category_city_idx" ON "BusinessOpportunity"("category", "city");
CREATE INDEX IF NOT EXISTS "BusinessOpportunity_jobId_idx" ON "BusinessOpportunity"("jobId");
CREATE INDEX IF NOT EXISTS "BusinessOpportunityAsset_businessOpportunityId_idx" ON "BusinessOpportunityAsset"("businessOpportunityId");
CREATE INDEX IF NOT EXISTS "BusinessWebsiteConcept_businessOpportunityId_createdAt_idx" ON "BusinessWebsiteConcept"("businessOpportunityId", "createdAt");
CREATE INDEX IF NOT EXISTS "BusinessWebsiteConcept_generationStatus_idx" ON "BusinessWebsiteConcept"("generationStatus");
CREATE INDEX IF NOT EXISTS "BusinessProposal_businessOpportunityId_createdAt_idx" ON "BusinessProposal"("businessOpportunityId", "createdAt");
CREATE INDEX IF NOT EXISTS "BusinessProposal_proposalStatus_idx" ON "BusinessProposal"("proposalStatus");
CREATE INDEX IF NOT EXISTS "BusinessOutreach_businessOpportunityId_createdAt_idx" ON "BusinessOutreach"("businessOpportunityId", "createdAt");
CREATE INDEX IF NOT EXISTS "BusinessOutreach_approvalStatus_deliveryStatus_idx" ON "BusinessOutreach"("approvalStatus", "deliveryStatus");
CREATE INDEX IF NOT EXISTS "BusinessOutreach_recipientEmail_idx" ON "BusinessOutreach"("recipientEmail");
CREATE UNIQUE INDEX IF NOT EXISTS "BusinessOutreachSuppression_email_key" ON "BusinessOutreachSuppression"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "BusinessOutreachSuppression_domain_key" ON "BusinessOutreachSuppression"("domain");
CREATE INDEX IF NOT EXISTS "BusinessOutreachSuppression_email_idx" ON "BusinessOutreachSuppression"("email");
CREATE INDEX IF NOT EXISTS "BusinessOutreachSuppression_domain_idx" ON "BusinessOutreachSuppression"("domain");

DO $$ BEGIN
  ALTER TABLE "BusinessOpportunity" ADD CONSTRAINT "BusinessOpportunity_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "BusinessOpportunityJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "BusinessOpportunityAsset" ADD CONSTRAINT "BusinessOpportunityAsset_businessOpportunityId_fkey" FOREIGN KEY ("businessOpportunityId") REFERENCES "BusinessOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "BusinessWebsiteConcept" ADD CONSTRAINT "BusinessWebsiteConcept_businessOpportunityId_fkey" FOREIGN KEY ("businessOpportunityId") REFERENCES "BusinessOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "BusinessProposal" ADD CONSTRAINT "BusinessProposal_businessOpportunityId_fkey" FOREIGN KEY ("businessOpportunityId") REFERENCES "BusinessOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "BusinessProposal" ADD CONSTRAINT "BusinessProposal_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "BusinessWebsiteConcept"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "BusinessOutreach" ADD CONSTRAINT "BusinessOutreach_businessOpportunityId_fkey" FOREIGN KEY ("businessOpportunityId") REFERENCES "BusinessOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "BusinessOutreach" ADD CONSTRAINT "BusinessOutreach_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "BusinessProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
