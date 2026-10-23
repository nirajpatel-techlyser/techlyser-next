import { NextResponse } from "next/server";
import { LeadStatus, Prisma } from "@prisma/client";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { prisma } from "@/lib/prisma";
import { leadsToCsv } from "@/leads/csv";

export const runtime = "nodejs";

const STATUSES = new Set<string>(Object.values(LeadStatus));

export async function GET(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const status = url.searchParams.get("status") || "";
  const country = url.searchParams.get("country") || "";
  const where: Prisma.LeadWhereInput = {
    ...(status && STATUSES.has(status) ? { status: status as LeadStatus } : {}),
    ...(country ? { targetCountry: country } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { domain: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const leads = await prisma.lead.findMany({
    where,
    orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
    take: 500,
    select: {
      name: true,
      website: true,
      domain: true,
      targetCountry: true,
      countryCode: true,
      shopifyConfidence: true,
      publicEmail: true,
      score: true,
      status: true,
      source: true,
      profiles: { select: { platform: true, url: true, verification: true } },
    },
  });
  const csv = leadsToCsv(leads);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=techlyser-leads.csv",
    },
  });
}
