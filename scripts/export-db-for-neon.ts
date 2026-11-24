/**
 * Export current DATABASE_URL data as JSON (+ optional SQL insert helpers)
 * for import into a new Neon project.
 *
 * Usage:
 *   npx tsx scripts/export-db-for-neon.ts
 *
 * Writes:
 *   backups/neon-export-<timestamp>/data.json
 *   backups/neon-export-<timestamp>/README.txt
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
    // Don't clobber an already-set env (allows EXPORT_DATABASE_URL / shell override).
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");
if (process.env.EXPORT_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.EXPORT_DATABASE_URL;
}

const prisma = new PrismaClient({ log: ["error"] });

async function safeCount(label: string, fn: () => Promise<number>) {
  try {
    return await fn();
  } catch (err) {
    console.warn(`skip count ${label}:`, err instanceof Error ? err.message : err);
    return -1;
  }
}

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.join(process.cwd(), "backups", `neon-export-${stamp}`);
  fs.mkdirSync(outDir, { recursive: true });

  console.log("Connecting…");
  await prisma.$queryRawUnsafe("SELECT 1");

  // Export core tables used by the live site + admin. Order matters for FK import.
  const data: Record<string, unknown> = {};

  const exporters: Array<[string, () => Promise<unknown>]> = [
    ["users", () => prisma.user.findMany()],
    ["accounts", () => prisma.account.findMany()],
    ["sessions", () => prisma.session.findMany()],
    ["verificationTokens", () => prisma.verificationToken.findMany()],
    ["siteSettings", () => prisma.siteSettings.findMany()],
    ["blogs", () => prisma.blog.findMany()],
    ["blogComments", () => prisma.blogComment.findMany()],
    ["categories", () => (prisma as any).category?.findMany?.() ?? []],
    ["tags", () => (prisma as any).tag?.findMany?.() ?? []],
    ["pageViews", () => prisma.pageView.findMany({ take: 50000 })],
    ["leads", () => prisma.lead.findMany()],
    ["leadResearchJobs", () => prisma.leadResearchJob.findMany()],
    ["leadOutreachDrafts", () => prisma.leadOutreachDraft.findMany()],
    ["leadSuppressions", () => prisma.leadSuppression.findMany()],
    ["websiteAudits", () => prisma.websiteAudit.findMany()],
    ["websiteAuditLeads", () => prisma.websiteAuditLead.findMany()],
    ["websiteAuditJobs", () => (prisma as any).websiteAuditJob?.findMany?.() ?? []],
    ["socialAccounts", () => prisma.socialAccount.findMany()],
    ["socialDistributions", () => prisma.socialDistribution.findMany()],
    ["socialPublishJobs", () => prisma.socialPublishJob.findMany()],
    ["socialPublishAttempts", () => prisma.socialPublishAttempt.findMany()],
    ["opportunities", () => prisma.opportunity.findMany()],
    ["contentPlans", () => prisma.contentPlan.findMany()],
    ["aiWriterRuns", () => prisma.aiWriterRun.findMany()],
    ["aiSeoGeoRuns", () => prisma.aiSeoGeoRun.findMany()],
    ["aiAgentRuns", () => prisma.aiAgentRun.findMany()],
    ["researchItems", () => prisma.researchItem.findMany()],
    ["businessOpportunityJobs", () => prisma.businessOpportunityJob.findMany()],
    ["businessOpportunities", () => prisma.businessOpportunity.findMany()],
    ["businessOpportunityAssets", () => prisma.businessOpportunityAsset.findMany()],
    ["businessWebsiteConcepts", () => prisma.businessWebsiteConcept.findMany()],
    ["businessProposals", () => prisma.businessProposal.findMany()],
    ["businessOutreach", () => prisma.businessOutreach.findMany()],
    ["businessOutreachSuppressions", () => prisma.businessOutreachSuppression.findMany()],
    ["businessOpportunitySettings", () => prisma.businessOpportunitySetting.findMany()],
  ];

  for (const [key, fn] of exporters) {
    try {
      const rows = await fn();
      data[key] = rows;
      const n = Array.isArray(rows) ? rows.length : 0;
      console.log(`exported ${key}: ${n}`);
    } catch (err) {
      console.warn(
        `skip ${key}:`,
        err instanceof Error ? err.message.slice(0, 160) : err,
      );
      data[key] = [];
    }
  }

  const dataPath = path.join(outDir, "data.json");
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");

  const counts: Record<string, number> = {};
  for (const [key, value] of Object.entries(data)) {
    counts[key] = Array.isArray(value) ? value.length : 0;
  }

  const readme = `Neon export created: ${new Date().toISOString()}

Source host: ${(process.env.DATABASE_URL || "").replace(/:[^:@/]+@/, ":***@").slice(0, 120)}

Files:
- data.json  (all exported rows)

Import into a NEW Neon project:
1. Create new Neon project (fresh 100 CU-hours).
2. Copy the new DATABASE_URL into .env.local (and Vercel env).
3. From this repo:
     npx prisma db push
     npx tsx scripts/import-db-from-neon-export.ts "${outDir.replace(/\\/g, "/")}"
4. Restart / redeploy.

Row counts:
${Object.entries(counts)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}
`;

  fs.writeFileSync(path.join(outDir, "README.txt"), readme, "utf8");
  console.log("\nWrote", outDir);
  console.log("data.json bytes:", fs.statSync(dataPath).size);
}

main()
  .catch((err) => {
    console.error("EXPORT_FAILED");
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
