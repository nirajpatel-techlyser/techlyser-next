import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { prisma } from "@/lib/prisma";
import { buildOutreachDrafts } from "@/leads/outreach";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      website: true,
      publicEmail: true,
      observedFacts: true,
      hypotheses: true,
      recommendedServices: true,
    },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  const facts = Array.isArray(lead.observedFacts)
    ? lead.observedFacts.filter((item): item is string => typeof item === "string")
    : [];
  const hypotheses = Array.isArray(lead.hypotheses)
    ? lead.hypotheses.filter((item): item is string => typeof item === "string")
    : [];
  const drafts = buildOutreachDrafts({
    name: lead.name,
    website: lead.website,
    publicEmail: lead.publicEmail,
    qualification: {
      observedFacts: facts,
      hypotheses,
      recommendedServices: lead.recommendedServices,
    },
  });
  await prisma.leadOutreachDraft.createMany({
    data: drafts.map((draft) => ({ leadId: lead.id, channel: draft.channel, body: draft.body })),
  });
  return NextResponse.json({ drafts });
}
