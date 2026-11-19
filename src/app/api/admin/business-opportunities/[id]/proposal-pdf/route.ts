import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { prisma } from "@/lib/prisma";
import { buildAgencyProposalPdf } from "@/lib/business-website-generator/proposal-pdf";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * Builds PDF from the exact Website Studio HTML (same design + content).
 * Auto-generates a concept first when none exists yet.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await context.params;
  const business = await prisma.businessOpportunity.findUnique({
    where: { id },
    select: { id: true, businessName: true },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  try {
    const url = new URL(request.url);
    const useCache = url.searchParams.get("cached") === "1";

    let pdfBase64: string | null = null;
    if (useCache) {
      const cached = await prisma.businessProposal.findFirst({
        where: {
          businessOpportunityId: id,
          pdfBase64: { not: null },
        },
        orderBy: { createdAt: "desc" },
        select: { pdfBase64: true },
      });
      pdfBase64 = cached?.pdfBase64 || null;
    }

    if (!pdfBase64) {
      const built = await buildAgencyProposalPdf(id);
      pdfBase64 = built.proposal.pdfBase64;
    }

    const bytes = Buffer.from(pdfBase64 || "", "base64");
    if (!bytes.byteLength) {
      return NextResponse.json({ error: "PDF file was empty." }, { status: 500 });
    }

    const filename = `${business.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "business"}-website-proposal.pdf`;

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not build PDF proposal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
