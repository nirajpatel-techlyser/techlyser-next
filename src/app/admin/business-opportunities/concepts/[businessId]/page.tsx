import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ConceptStudio from "@/components/admin/business-opportunities/ConceptStudio";
import { getLatestConcept } from "@/lib/business-website-generator/generate-concept";
import { signConceptPreviewToken } from "@/lib/business-website-generator/preview-token";

export const dynamic = "force-dynamic";

export default async function ConceptDetailPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const business = await prisma.businessOpportunity.findUnique({
    where: { id: businessId },
    select: { id: true, businessName: true },
  });
  if (!business) notFound();

  const concept = await getLatestConcept(business.id);
  const previewPath = concept
    ? `/api/public/business-concepts/${encodeURIComponent(signConceptPreviewToken(concept.id))}`
    : null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <ConceptStudio
        businessId={business.id}
        businessName={business.businessName}
        initialConcept={
          concept
            ? {
                id: concept.id,
                conceptTitle: concept.conceptTitle,
                generatedHtml: concept.generatedHtml,
                generationStatus: concept.generationStatus,
                previewScreenshotUrl: concept.previewScreenshotUrl,
              }
            : null
        }
        initialPreviewPath={previewPath}
      />
    </section>
  );
}
