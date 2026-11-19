import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { buildAgencyProposalPdf } from "@/lib/business-website-generator/proposal-pdf";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;

  try {
    const result = await buildAgencyProposalPdf(id);
    return NextResponse.json({
      proposal: {
        id: result.proposal.id,
        proposalStatus: result.proposal.proposalStatus,
        generatedAt: result.proposal.generatedAt,
        conceptId: result.conceptId,
        hasPdf: Boolean(result.proposal.pdfBase64),
      },
      quality: result.quality,
      usedStudioHtml: result.usedStudioHtml,
      note: result.quality.needsReview
        ? `Proposal saved as draft for review: ${result.quality.issues.join(" ")}`
        : result.usedStudioHtml
          ? "PDF ready with the exact Website Studio design. Email was not sent."
          : "PDF ready (drawn fallback — install/start Chromium for exact studio export). Email was not sent.",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "PDF proposal generation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
