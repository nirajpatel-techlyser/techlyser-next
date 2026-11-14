-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "WebsiteAuditStatus" AS ENUM ('PENDING', 'FETCHING', 'ANALYZING', 'GENERATING_RECOMMENDATIONS', 'AWAITING_EMAIL', 'GENERATING_PDF', 'SENDING_EMAIL', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "WebsiteAuditJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "WebsiteAuditLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "WebsiteAuditLead" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "companyName" TEXT,
  "websiteUrl" TEXT NOT NULL,
  "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
  "consentAt" TIMESTAMP(3),
  "status" "WebsiteAuditLeadStatus" NOT NULL DEFAULT 'NEW',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebsiteAuditLead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WebsiteAudit" (
  "id" TEXT NOT NULL,
  "leadId" TEXT,
  "websiteUrl" TEXT NOT NULL,
  "normalizedUrl" TEXT NOT NULL,
  "status" "WebsiteAuditStatus" NOT NULL DEFAULT 'PENDING',
  "overallScore" INTEGER,
  "categoryScores" JSONB,
  "technicalFindings" JSONB,
  "aiRecommendations" JSONB,
  "pagesAnalyzed" JSONB,
  "reportHtml" TEXT,
  "reportPdfBase64" TEXT,
  "reportFileName" TEXT,
  "emailSentAt" TIMESTAMP(3),
  "emailError" TEXT,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "checksPerformed" INTEGER NOT NULL DEFAULT 0,
  "checksUnavailable" INTEGER NOT NULL DEFAULT 0,
  "requestIpHash" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebsiteAudit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WebsiteAuditJob" (
  "id" TEXT NOT NULL,
  "auditId" TEXT NOT NULL,
  "status" "WebsiteAuditJobStatus" NOT NULL DEFAULT 'QUEUED',
  "step" TEXT NOT NULL DEFAULT 'queued',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebsiteAuditJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WebsiteAuditLead_email_createdAt_idx" ON "WebsiteAuditLead"("email", "createdAt");
CREATE INDEX IF NOT EXISTS "WebsiteAuditLead_status_createdAt_idx" ON "WebsiteAuditLead"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "WebsiteAudit_status_createdAt_idx" ON "WebsiteAudit"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "WebsiteAudit_normalizedUrl_createdAt_idx" ON "WebsiteAudit"("normalizedUrl", "createdAt");
CREATE INDEX IF NOT EXISTS "WebsiteAudit_leadId_idx" ON "WebsiteAudit"("leadId");
CREATE INDEX IF NOT EXISTS "WebsiteAuditJob_auditId_status_idx" ON "WebsiteAuditJob"("auditId", "status");
CREATE INDEX IF NOT EXISTS "WebsiteAuditJob_status_createdAt_idx" ON "WebsiteAuditJob"("status", "createdAt");

DO $$ BEGIN
  ALTER TABLE "WebsiteAudit" ADD CONSTRAINT "WebsiteAudit_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "WebsiteAuditLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "WebsiteAuditJob" ADD CONSTRAINT "WebsiteAuditJob_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "WebsiteAudit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
