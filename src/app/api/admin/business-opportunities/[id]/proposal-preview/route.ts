import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { prisma } from "@/lib/prisma";
import { getLatestConcept } from "@/lib/business-website-generator/generate-concept";
import { signConceptPreviewToken } from "@/lib/business-website-generator/preview-token";

export const runtime = "nodejs";

/** Compatibility endpoint: returns latest concept HTML for iframe preview. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;

  const concept = await getLatestConcept(id);
  const latestProposal = await prisma.businessProposal.findFirst({
    where: { businessOpportunityId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      proposalStatus: true,
      generatedAt: true,
      pdfBase64: true,
      conceptId: true,
    },
  });

  if (!concept) {
    return NextResponse.json({
      html: null,
      concept: null,
      proposal: latestProposal
        ? {
            id: latestProposal.id,
            proposalStatus: latestProposal.proposalStatus,
            generatedAt: latestProposal.generatedAt,
            hasPdf: Boolean(latestProposal.pdfBase64),
          }
        : null,
      note: "No concept yet. Use Generate Website Design.",
    });
  }

  const token = signConceptPreviewToken(concept.id);
  return NextResponse.json({
    businessId: id,
    html: concept.generatedHtml,
    concept: {
      id: concept.id,
      conceptTitle: concept.conceptTitle,
      generationStatus: concept.generationStatus,
      previewScreenshotUrl: concept.previewScreenshotUrl,
    },
    proposal: latestProposal
      ? {
          id: latestProposal.id,
          proposalStatus: latestProposal.proposalStatus,
          generatedAt: latestProposal.generatedAt,
          hasPdf: Boolean(latestProposal.pdfBase64),
        }
      : null,
    previewPath: `/api/public/business-concepts/${encodeURIComponent(token)}`,
  });
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;

  // Back-compat: old "Generate mockup PDF" button now creates concept + agency PDF.
  const { generateWebsiteConcept } = await import(
    "@/lib/business-website-generator/generate-concept"
  );
  const { buildAgencyProposalPdf } = await import(
    "@/lib/business-website-generator/proposal-pdf"
  );

  try {
    const concept = await generateWebsiteConcept(id);
    const result = await buildAgencyProposalPdf(id);
    return NextResponse.json({
      html: concept.generatedHtml,
      proposal: {
        id: result.proposal.id,
        proposalStatus: result.proposal.proposalStatus,
        generatedAt: result.proposal.generatedAt,
        hasPdf: true,
      },
      quality: result.quality,
      note: "Concept + agency PDF generated. Email was not sent.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
