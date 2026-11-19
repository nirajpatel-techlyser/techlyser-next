import { prisma } from "@/lib/prisma";
import { generateWebsiteConcept } from "@/lib/business-website-generator/generate-concept";
import { captureConceptScreenshots } from "@/lib/business-website-generator/screenshots";
import { buildAgencyProposalPdf } from "@/lib/business-website-generator/proposal-pdf";

/**
 * Durable-style pipeline for a single business opportunity.
 * Mirrors BizJobStep names without requiring a separate queue worker.
 */
export async function runConceptProposalPipeline(businessOpportunityId: string) {
  await prisma.businessOpportunity.update({
    where: { id: businessOpportunityId },
    data: { leadStatus: "REVIEWING" },
  });

  const concept = await generateWebsiteConcept(businessOpportunityId);
  await captureConceptScreenshots(concept.id);
  const proposal = await buildAgencyProposalPdf(businessOpportunityId);

  return {
    conceptId: concept.id,
    proposalId: proposal.proposal.id,
    quality: proposal.quality,
  };
}
