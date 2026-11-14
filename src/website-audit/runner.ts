import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateAiRecommendations } from "@/website-audit/ai";
import { runTechnicalAudit } from "@/website-audit/engine";
import { sendAuditReportEmail } from "@/website-audit/email";
import { buildReportAssets } from "@/website-audit/report";
import type { AiRecommendation, TechnicalAuditResult } from "@/website-audit/types";

async function setAudit(auditId: string, data: Prisma.WebsiteAuditUpdateInput) {
  return prisma.websiteAudit.update({ where: { id: auditId }, data });
}

async function setJob(jobId: string, data: Prisma.WebsiteAuditJobUpdateInput) {
  return prisma.websiteAuditJob.update({ where: { id: jobId }, data });
}

async function deliverReport(auditId: string) {
  const audit = await prisma.websiteAudit.findUnique({
    where: { id: auditId },
    include: { jobs: { orderBy: { createdAt: "desc" }, take: 1 }, lead: true },
  });
  if (!audit) throw new Error("Audit not found.");
  if (!audit.lead) throw new Error("Email is required before sending the report.");
  if (!audit.technicalFindings) throw new Error("Audit is not ready yet.");

  const job = audit.jobs[0];
  const technical = audit.technicalFindings as unknown as TechnicalAuditResult;
  const recommendations =
    (audit.aiRecommendations as unknown as AiRecommendation[]) || [];

  await setAudit(audit.id, { status: "GENERATING_PDF" });
  if (job) await setJob(job.id, { step: "generating_pdf", progress: 88 });

  const { reportHtml, pdfBase64 } = await buildReportAssets({
    websiteUrl: audit.normalizedUrl,
    businessName: audit.lead.companyName || audit.lead.name,
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
      to: audit.lead.email,
      name: audit.lead.name,
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
    return {
      auditId: audit.id,
      email: audit.lead.email,
      emailSent: true as const,
    };
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
      email: audit.lead.email,
      emailSent: false as const,
      emailError: message,
    };
  }
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

  if (
    audit.status === "AWAITING_EMAIL" ||
    audit.status === "GENERATING_PDF" ||
    audit.status === "SENDING_EMAIL"
  ) {
    if (!audit.lead) {
      return { auditId, status: audit.status, progress: job.progress, step: job.step };
    }
    const delivered = await deliverReport(auditId);
    return {
      status: "COMPLETED" as const,
      progress: 100,
      step: delivered.emailSent ? "completed" : "completed_with_email_error",
      ...delivered,
    };
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
      await setAudit(auditId, {
        status: "FETCHING",
        startedAt: audit.startedAt || new Date(),
      });
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

      // Stop here so PDF/screenshots run on the next advance tick (avoids serverless timeout).
      return {
        auditId,
        status: "AWAITING_EMAIL" as const,
        progress: 80,
        step: "awaiting_email",
      };
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
    include: { lead: true },
  });
  if (!audit) throw new Error("Audit not found.");
  if (audit.status === "FAILED") throw new Error("This audit failed. Start a new one.");
  if (!audit.technicalFindings) throw new Error("Audit is not ready yet.");

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

  return deliverReport(audit.id);
}
