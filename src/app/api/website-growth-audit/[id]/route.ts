import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  const { id } = await context.params;
  const audit = await prisma.websiteAudit.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      websiteUrl: true,
      normalizedUrl: true,
      overallScore: true,
      categoryScores: true,
      technicalFindings: true,
      aiRecommendations: true,
      pagesAnalyzed: true,
      checksPerformed: true,
      checksUnavailable: true,
      errorMessage: true,
      emailSentAt: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
      jobs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { step: true, progress: true, status: true },
      },
      lead: { select: { email: true, name: true } },
    },
  });
  if (!audit) {
    return NextResponse.json({ error: "Audit not found." }, { status: 404 });
  }

  const findings = (audit.technicalFindings as { findings?: unknown[] } | null)?.findings;
  const previewFindings = Array.isArray(findings) ? findings.slice(0, 12) : [];

  return NextResponse.json({
    id: audit.id,
    status: audit.status,
    websiteUrl: audit.websiteUrl,
    normalizedUrl: audit.normalizedUrl,
    overallScore: audit.overallScore,
    categoryScores: audit.categoryScores,
    pagesAnalyzed: audit.pagesAnalyzed,
    checksPerformed: audit.checksPerformed,
    checksUnavailable: audit.checksUnavailable,
    recommendations: audit.aiRecommendations,
    previewFindings,
    errorMessage: audit.errorMessage,
    emailSentAt: audit.emailSentAt,
    hasLead: Boolean(audit.lead),
    job: audit.jobs[0] || null,
    startedAt: audit.startedAt,
    completedAt: audit.completedAt,
    createdAt: audit.createdAt,
  });
}
