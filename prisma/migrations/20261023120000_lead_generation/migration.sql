-- Internal lead research. Additive only. Does not change Blog or contact data.
-- Prisma (postgres role) bypasses RLS. anon/authenticated get no access.

CREATE TYPE "LeadStatus" AS ENUM (
  'DISCOVERED',
  'NEEDS_REVIEW',
  'QUALIFIED',
  'DISQUALIFIED',
  'CONTACTED',
  'REPLIED',
  'CONVERTED'
);
CREATE TYPE "LeadJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE "LeadSocialPlatform" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'YOUTUBE', 'OTHER');
CREATE TYPE "LeadVerification" AS ENUM ('UNVERIFIED', 'VERIFIED', 'REJECTED');

CREATE TABLE "LeadResearchJob" (
  "id" TEXT NOT NULL,
  "status" "LeadJobStatus" NOT NULL DEFAULT 'QUEUED',
  "targetCountry" TEXT NOT NULL,
  "city" TEXT,
  "niche" TEXT NOT NULL,
  "keywords" TEXT NOT NULL,
  "leadLimit" INTEGER NOT NULL,
  "shopifyOnly" BOOLEAN NOT NULL DEFAULT true,
  "minScore" INTEGER NOT NULL DEFAULT 50,
  "provider" TEXT NOT NULL,
  "targets" JSONB NOT NULL,
  "cursor" INTEGER NOT NULL DEFAULT 0,
  "discoveredCount" INTEGER NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  "createdByUserId" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LeadResearchJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lead" (
  "id" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "website" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "targetCountry" TEXT NOT NULL,
  "countryCode" TEXT,
  "city" TEXT,
  "locationNote" TEXT,
  "publicEmail" TEXT,
  "shopifyDetected" BOOLEAN NOT NULL DEFAULT false,
  "shopifyConfidence" TEXT NOT NULL DEFAULT 'none',
  "shopifyEvidence" JSONB NOT NULL,
  "shopifyCheckedAt" TIMESTAMP(3),
  "score" INTEGER NOT NULL DEFAULT 0,
  "scoreExplanation" TEXT NOT NULL,
  "observedFacts" JSONB NOT NULL,
  "hypotheses" JSONB NOT NULL,
  "recommendedServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "source" TEXT NOT NULL,
  "status" "LeadStatus" NOT NULL DEFAULT 'DISCOVERED',
  "notes" TEXT,
  "lastVerifiedAt" TIMESTAMP(3),
  "jobId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeadSocialProfile" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "platform" "LeadSocialPlatform" NOT NULL,
  "url" TEXT NOT NULL,
  "verification" "LeadVerification" NOT NULL DEFAULT 'UNVERIFIED',
  "evidence" TEXT NOT NULL,
  "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadSocialProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeadOutreachDraft" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadOutreachDraft_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeadSuppression" (
  "id" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadSuppression_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Lead_domain_key" ON "Lead"("domain");
CREATE INDEX "Lead_status_score_idx" ON "Lead"("status", "score");
CREATE INDEX "Lead_targetCountry_status_idx" ON "Lead"("targetCountry", "status");
CREATE INDEX "Lead_jobId_idx" ON "Lead"("jobId");
CREATE UNIQUE INDEX "LeadSocialProfile_leadId_platform_key" ON "LeadSocialProfile"("leadId", "platform");
CREATE INDEX "LeadSocialProfile_leadId_idx" ON "LeadSocialProfile"("leadId");
CREATE INDEX "LeadOutreachDraft_leadId_createdAt_idx" ON "LeadOutreachDraft"("leadId", "createdAt");
CREATE UNIQUE INDEX "LeadSuppression_domain_key" ON "LeadSuppression"("domain");
CREATE INDEX "LeadResearchJob_status_createdAt_idx" ON "LeadResearchJob"("status", "createdAt");

ALTER TABLE "Lead" ADD CONSTRAINT "Lead_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "LeadResearchJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LeadSocialProfile" ADD CONSTRAINT "LeadSocialProfile_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeadOutreachDraft" ADD CONSTRAINT "LeadOutreachDraft_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeadResearchJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadSocialProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadOutreachDraft" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadSuppression" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "LeadResearchJob" FROM anon, authenticated;
REVOKE ALL ON TABLE "Lead" FROM anon, authenticated;
REVOKE ALL ON TABLE "LeadSocialProfile" FROM anon, authenticated;
REVOKE ALL ON TABLE "LeadOutreachDraft" FROM anon, authenticated;
REVOKE ALL ON TABLE "LeadSuppression" FROM anon, authenticated;
