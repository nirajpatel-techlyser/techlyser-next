import { NextResponse } from "next/server";
import {
  Prisma,
  WebsiteAuditLeadStatus,
  WebsiteAuditStatus,
} from "@prisma/client";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const AUDIT_STATUSES = new Set<string>(Object.values(WebsiteAuditStatus));
const LEAD_STATUSES = new Set<string>(Object.values(WebsiteAuditLeadStatus));

function csvEscape(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export async function GET(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const status = url.searchParams.get("status") || "";
  const leadStatus = url.searchParams.get("leadStatus") || "";

  const where: Prisma.WebsiteAuditWhereInput = {
    ...(status && AUDIT_STATUSES.has(status)
      ? { status: status as WebsiteAuditStatus }
      : {}),
    ...(leadStatus && LEAD_STATUSES.has(leadStatus)
      ? { lead: { status: leadStatus as WebsiteAuditLeadStatus } }
      : {}),
    ...(q
      ? {
          OR: [
            { normalizedUrl: { contains: q, mode: "insensitive" } },
            { websiteUrl: { contains: q, mode: "insensitive" } },
            { lead: { email: { contains: q, mode: "insensitive" } } },
            { lead: { companyName: { contains: q, mode: "insensitive" } } },
            { lead: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const audits = await prisma.websiteAudit.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 1000,
    select: {
      id: true,
      websiteUrl: true,
      normalizedUrl: true,
      status: true,
      overallScore: true,
      checksPerformed: true,
      checksUnavailable: true,
      emailSentAt: true,
      createdAt: true,
      completedAt: true,
      lead: {
        select: {
          email: true,
          name: true,
          companyName: true,
          status: true,
          marketingConsent: true,
        },
      },
    },
  });

  const header = [
    "id",
    "websiteUrl",
    "normalizedUrl",
    "status",
    "overallScore",
    "checksPerformed",
    "checksUnavailable",
    "email",
    "name",
    "companyName",
    "leadStatus",
    "marketingConsent",
    "emailSentAt",
    "createdAt",
    "completedAt",
  ];

  const lines = [
    header.join(","),
    ...audits.map((row) =>
      [
        row.id,
        row.websiteUrl,
        row.normalizedUrl,
        row.status,
        row.overallScore,
        row.checksPerformed,
        row.checksUnavailable,
        row.lead?.email,
        row.lead?.name,
        row.lead?.companyName,
        row.lead?.status,
        row.lead?.marketingConsent,
        row.emailSentAt?.toISOString(),
        row.createdAt.toISOString(),
        row.completedAt?.toISOString(),
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="techlyser-website-audits.csv"',
    },
  });
}
