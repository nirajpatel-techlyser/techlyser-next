import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import {
  generateWebsiteConcept,
  getLatestConcept,
} from "@/lib/business-website-generator/generate-concept";
import { listBusinessAssets } from "@/lib/business-discovery/images";
import { signConceptPreviewToken } from "@/lib/business-website-generator/preview-token";
import { getConceptScreenshotAssets } from "@/lib/business-website-generator/screenshots";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;

  const concept = await getLatestConcept(id);
  const assets = await listBusinessAssets(id);
  const shots = await getConceptScreenshotAssets(id);
  const previewToken = concept ? signConceptPreviewToken(concept.id) : null;

  return NextResponse.json({
    concept,
    assets,
    screenshots: shots,
    previewPath: previewToken
      ? `/api/public/business-concepts/${encodeURIComponent(previewToken)}`
      : null,
  });
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;

  try {
    const concept = await generateWebsiteConcept(id);
    const previewToken = signConceptPreviewToken(concept.id);
    const { ensurePublicListingPath } = await import(
      "@/lib/business-website-generator/public-listing"
    );
    const listing = await ensurePublicListingPath(id);
    return NextResponse.json({
      concept,
      previewPath: `/api/public/business-concepts/${encodeURIComponent(previewToken)}`,
      publicListingUrl: listing.url,
      publicListingPath: listing.path,
      note: "Website concept generated. Share the public link, or export PDF as a secondary option.",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Concept generation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
