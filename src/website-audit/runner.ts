import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateAiRecommendations } from "@/website-audit/ai";
import { runTechnicalAudit } from "@/website-audit/engine";
import { sendAuditReportEmail } from "@/website-audit/email";
import { buildReportHtml, buildReportPdfBase64 } from "@/website-audit/report";
import type { AiRecommendation, TechnicalAuditResult } from "@/website-audit/types";

async function setAudit(
  auditId: string,
  data: Prisma.WebsiteAuditUpdateInput,
) {
  return prisma.websiteAudit.update({ where: { id: auditId }, data });
}

async function setJob(
  jobId: string,
  data: Prisma.WebsiteAuditJobUpdateInput,
) {
  return prisma.websiteAuditJob.update({ where: { id: jobId }, data });
}

export async function advanceWebsiteAudit(auditId: string) {
  const audit = await prisma.websiteAudit.findUnique({
    where: { id: auditId },
    include: {
      jobs: { orderBy: { createdAt: "desc" }, take: 1 },
      lead: true,
    },
  });
  if (!audit) throw new Error("Audit not found.");
  const job = audit.jobs[0];
  if (!job) throw new Error("Audit job not found.");
  if (audit.status === "COMPLETED" || audit.status === "FAILED") {
    return { auditId, status: audit.status, progress: job.progress, step: job.step };
  }
  if (audit.status === "AWAITING_EMAIL") {
    return { auditId, status: audit.status, progress: job.progress, step: job.step };
  }

  await setJob(job.id, {
    status: "RUNNING",
    startedAt: job.startedAt || new Date(),
  });

  try {
    if (
      audit.status === "PENDING" ||
      audit.status === "FETCHING" ||
      audit.status === "ANALYZING" ||
      !audit.technicalFindings
    ) {
      await setAudit(auditId, { status: "FETCHING", startedAt: audit.startedAt || new Date() });
      await setJob(job.id, { step: "fetching", progress: 15 });
      await setAudit(auditId, { status: "ANALYZING" });
      await setJob(job.id, { step: "analyzing", progress: 40 });
      const technical = await runTechnicalAudit(audit.normalizedUrl);
      await setAudit(auditId, {
        status: "GENERATING_RECOMMENDATIONS",
        technicalFindings: technical as unknown as Prisma.InputJsonValue,
        categoryScores: technical.categoryScores as unknown as Prisma.InputJsonValue,
        pagesAnalyzed: technical.pages as unknown as Prisma.InputJsonValue,
        overallScore: technical.overallScore,
        checksPerformed: technical.checksPerformed,
        checksUnavailable: technical.checksUnavailable,
        normalizedUrl: technical.normalizedUrl,
      });
      await setJob(job.id, { step: "generating_recommendations", progress: 65 });

      const recommendations = await generateAiRecommendations(technical);
      await setAudit(auditId, {
        status: "AWAITING_EMAIL",
        aiRecommendations: recommendations as unknown as Prisma.InputJsonValue,
      });
      await setJob(job.id, { step: "awaiting_email", progress: 80, status: "RUNNING" });
      return { auditId, status: "AWAITING_EMAIL" as const, progress: 80, step: "awaiting_email" };
    }

    return {
      auditId,
      status: audit.status,
      progress: job.progress,
      step: job.step,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Audit failed";
    await setAudit(auditId, {
      status: "FAILED",
      errorCode: "AUDIT_FAILED",
      errorMessage: message,
      completedAt: new Date(),
    });
    await setJob(job.id, {
      status: "FAILED",
      errorCode: "AUDIT_FAILED",
      errorMessage: message,
      completedAt: new Date(),
    });
    throw error;
  }
}

export async function completeAuditWithEmail(input: {
  auditId: string;
  email: string;
  name?: string | null;
  companyName?: string | null;
  marketingConsent?: boolean;
}) {
  const audit = await prisma.websiteAudit.findUnique({
    where: { id: input.auditId },
    include: { jobs: { orderBy: { createdAt: "desc" }, take: 1 }, lead: true },
  });
  if (!audit) throw new Error("Audit not found.");
  if (audit.status === "FAILED") throw new Error("This audit failed. Start a new one.");
  if (!audit.technicalFindings) throw new Error("Audit is not ready yet.");

  const job = audit.jobs[0];
  const technical = audit.technicalFindings as unknown as TechnicalAuditResult;
  const recommendations =
    (audit.aiRecommendations as unknown as AiRecommendation[]) || [];

  const lead =
    audit.lead ||
    (await prisma.websiteAuditLead.create({
      data: {
        email: input.email.toLowerCase().trim(),
        name: input.name?.trim() || null,
        companyName: input.companyName?.trim() || null,
        websiteUrl: audit.websiteUrl,
        marketingConsent: Boolean(input.marketingConsent),
        consentAt: new Date(),
      },
    }));

  if (audit.leadId !== lead.id) {
    await prisma.websiteAudit.update({
      where: { id: audit.id },
      data: { leadId: lead.id },
    });
  }

  await setAudit(audit.id, { status: "GENERATING_PDF" });
  if (job) await setJob(job.id, { step: "generating_pdf", progress: 88 });

  const reportHtml = buildReportHtml({
    websiteUrl: audit.normalizedUrl,
    businessName: input.companyName || input.name,
    result: technical,
    recommendations,
  });
  const pdfBase64 = buildReportPdfBase64({
    websiteUrl: audit.normalizedUrl,
    businessName: input.companyName || input.name,
    result: technical,
    recommendations,
  });
  const fileName = `techlyser-website-growth-audit-${audit.id.slice(0, 8)}.pdf`;

  await setAudit(audit.id, {
    status: "SENDING_EMAIL",
    reportHtml,
    reportPdfBase64: pdfBase64,
    reportFileName: fileName,
  });
  if (job) await setJob(job.id, { step: "sending_email", progress: 94 });

  try {
    await sendAuditReportEmail({
      to: input.email.toLowerCase().trim(),
      name: input.name,
      websiteUrl: audit.normalizedUrl,
      pdfBase64,
      fileName,
    });
    await setAudit(audit.id, {
      status: "COMPLETED",
      emailSentAt: new Date(),
      emailError: null,
      completedAt: new Date(),
    });
    if (job) {
      await setJob(job.id, {
        status: "COMPLETED",
        step: "completed",
        progress: 100,
        completedAt: new Date(),
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email failed";
    await setAudit(audit.id, {
      status: "COMPLETED",
      emailError: message,
      completedAt: new Date(),
    });
    if (job) {
      await setJob(job.id, {
        status: "COMPLETED",
        step: "completed_with_email_error",
        progress: 100,
        completedAt: new Date(),
        errorMessage: message,
      });
    }
    return {
      auditId: audit.id,
      email: input.email.toLowerCase().trim(),
      emailSent: false as const,
      emailError: message,
    };
  }

  return {
    auditId: audit.id,
    email: input.email.toLowerCase().trim(),
    emailSent: true as const,
  };
}
