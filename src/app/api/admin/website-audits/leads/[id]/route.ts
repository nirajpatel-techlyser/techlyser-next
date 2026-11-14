import { NextResponse } from "next/server";
import { WebsiteAuditLeadStatus } from "@prisma/client";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const STATUSES = new Set<string>(Object.values(WebsiteAuditLeadStatus));

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    notes?: string;
    status?: string;
  } | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (body.status && !STATUSES.has(body.status)) {
    return NextResponse.json({ error: "Unknown lead status." }, { status: 400 });
  }

  const lead = await prisma.websiteAuditLead.update({
    where: { id },
    data: {
      ...(typeof body.notes === "string" ? { notes: body.notes.slice(0, 5000) } : {}),
      ...(body.status ? { status: body.status as WebsiteAuditLeadStatus } : {}),
    },
    select: { id: true, status: true, notes: true },
  });

  return NextResponse.json({ lead });
}
