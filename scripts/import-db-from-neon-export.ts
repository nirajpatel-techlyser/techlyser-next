/**
 * Import backups/neon-export-*/data.json into the CURRENT DATABASE_URL.
 *
 * Prerequisites:
 *   1. New Neon DATABASE_URL in .env.local
 *   2. npx prisma db push
 *
 * Usage:
 *   npx tsx scripts/import-db-from-neon-export.ts backups/neon-export-YYYY-...
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

function loadEnvFile(file: string) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) return;
  for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const exportDir = process.argv[2];
if (!exportDir) {
  console.error(
    "Usage: npx tsx scripts/import-db-from-neon-export.ts backups/neon-export-...",
  );
  process.exit(1);
}

const dataPath = path.join(exportDir, "data.json");
if (!fs.existsSync(dataPath)) {
  console.error("Missing", dataPath);
  process.exit(1);
}

const prisma = new PrismaClient({ log: ["error"] });
const data = JSON.parse(fs.readFileSync(dataPath, "utf8")) as Record<
  string,
  Record<string, unknown>[]
>;

function reviveDates<T extends Record<string, unknown>>(row: T): T {
  const out: Record<string, unknown> = { ...row };
  for (const [k, v] of Object.entries(out)) {
    if (
      typeof v === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)
    ) {
      out[k] = new Date(v);
    }
  }
  return out as T;
}

async function createMany(
  label: string,
  rows: Record<string, unknown>[] | undefined,
  fn: (data: Record<string, unknown>[]) => Promise<unknown>,
) {
  if (!rows?.length) {
    console.log(`skip ${label} (0)`);
    return;
  }
  const batch = rows.map((r) => reviveDates(r));
  // Insert in chunks to avoid payload limits
  const size = 100;
  for (let i = 0; i < batch.length; i += size) {
    const slice = batch.slice(i, i + size);
    await fn(slice);
  }
  console.log(`imported ${label}: ${batch.length}`);
}

async function main() {
  await prisma.$queryRawUnsafe("SELECT 1");
  console.log("Connected to target DB");

  // Parents first. Skip auth sessions (users can re-login).
  await createMany("users", data.users, (d) =>
    prisma.user.createMany({ data: d as never, skipDuplicates: true }),
  );
  await createMany("accounts", data.accounts, (d) =>
    prisma.account.createMany({ data: d as never, skipDuplicates: true }),
  );
  await createMany("siteSettings", data.siteSettings, (d) =>
    prisma.siteSettings.createMany({ data: d as never, skipDuplicates: true }),
  );
  await createMany("blogs", data.blogs, (d) =>
    prisma.blog.createMany({ data: d as never, skipDuplicates: true }),
  );
  await createMany("blogComments", data.blogComments, (d) =>
    prisma.blogComment.createMany({ data: d as never, skipDuplicates: true }),
  );
  await createMany("pageViews", data.pageViews, (d) =>
    prisma.pageView.createMany({ data: d as never, skipDuplicates: true }),
  );

  await createMany("leads", data.leads, (d) =>
    prisma.lead.createMany({ data: d as never, skipDuplicates: true }),
  );
  await createMany("leadResearchJobs", data.leadResearchJobs, (d) =>
    prisma.leadResearchJob.createMany({ data: d as never, skipDuplicates: true }),
  );
  await createMany("leadOutreachDrafts", data.leadOutreachDrafts, (d) =>
    prisma.leadOutreachDraft.createMany({
      data: d as never,
      skipDuplicates: true,
    }),
  );
  await createMany("leadSuppressions", data.leadSuppressions, (d) =>
    prisma.leadSuppression.createMany({
      data: d as never,
      skipDuplicates: true,
    }),
  );

  await createMany("websiteAuditLeads", data.websiteAuditLeads, (d) =>
    prisma.websiteAuditLead.createMany({
      data: d as never,
      skipDuplicates: true,
    }),
  );
  await createMany("websiteAudits", data.websiteAudits, (d) =>
    prisma.websiteAudit.createMany({ data: d as never, skipDuplicates: true }),
  );
  await createMany("websiteAuditJobs", data.websiteAuditJobs, (d) =>
    prisma.websiteAuditJob.createMany({
      data: d as never,
      skipDuplicates: true,
    }),
  );

  await createMany("socialAccounts", data.socialAccounts, (d) =>
    prisma.socialAccount.createMany({ data: d as never, skipDuplicates: true }),
  );
  await createMany("socialDistributions", data.socialDistributions, (d) =>
    prisma.socialDistribution.createMany({
      data: d as never,
      skipDuplicates: true,
    }),
  );
  await createMany("socialPublishJobs", data.socialPublishJobs, (d) =>
    prisma.socialPublishJob.createMany({
      data: d as never,
      skipDuplicates: true,
    }),
  );
  await createMany("socialPublishAttempts", data.socialPublishAttempts, (d) =>
    prisma.socialPublishAttempt.createMany({
      data: d as never,
      skipDuplicates: true,
    }),
  );

  await createMany("opportunities", data.opportunities, (d) =>
    prisma.opportunity.createMany({ data: d as never, skipDuplicates: true }),
  );
  await createMany("contentPlans", data.contentPlans, (d) =>
    prisma.contentPlan.createMany({ data: d as never, skipDuplicates: true }),
  );
  await createMany("aiWriterRuns", data.aiWriterRuns, (d) =>
    prisma.aiWriterRun.createMany({ data: d as never, skipDuplicates: true }),
  );
  await createMany("aiSeoGeoRuns", data.aiSeoGeoRuns, (d) =>
    prisma.aiSeoGeoRun.createMany({ data: d as never, skipDuplicates: true }),
  );
  await createMany("aiAgentRuns", data.aiAgentRuns, (d) =>
    prisma.aiAgentRun.createMany({ data: d as never, skipDuplicates: true }),
  );
  await createMany("researchItems", data.researchItems, (d) =>
    prisma.researchItem.createMany({ data: d as never, skipDuplicates: true }),
  );

  await createMany("businessOpportunityJobs", data.businessOpportunityJobs, (d) =>
    prisma.businessOpportunityJob.createMany({
      data: d as never,
      skipDuplicates: true,
    }),
  );
  await createMany("businessOpportunities", data.businessOpportunities, (d) =>
    prisma.businessOpportunity.createMany({
      data: d as never,
      skipDuplicates: true,
    }),
  );
  await createMany(
    "businessOpportunityAssets",
    data.businessOpportunityAssets,
    (d) =>
      prisma.businessOpportunityAsset.createMany({
        data: d as never,
        skipDuplicates: true,
      }),
  );
  await createMany("businessWebsiteConcepts", data.businessWebsiteConcepts, (d) =>
    prisma.businessWebsiteConcept.createMany({
      data: d as never,
      skipDuplicates: true,
    }),
  );
  await createMany("businessProposals", data.businessProposals, (d) =>
    prisma.businessProposal.createMany({
      data: d as never,
      skipDuplicates: true,
    }),
  );
  await createMany("businessOutreach", data.businessOutreach, (d) =>
    prisma.businessOutreach.createMany({
      data: d as never,
      skipDuplicates: true,
    }),
  );
  await createMany(
    "businessOutreachSuppressions",
    data.businessOutreachSuppressions,
    (d) =>
      prisma.businessOutreachSuppression.createMany({
        data: d as never,
        skipDuplicates: true,
      }),
  );
  await createMany(
    "businessOpportunitySettings",
    data.businessOpportunitySettings,
    (d) =>
      prisma.businessOpportunitySetting.createMany({
        data: d as never,
        skipDuplicates: true,
      }),
  );

  console.log("Import finished.");
}

main()
  .catch((err) => {
    console.error("IMPORT_FAILED");
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
