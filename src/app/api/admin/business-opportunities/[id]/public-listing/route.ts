import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { ensurePublicListingPath } from "@/lib/business-website-generator/public-listing";

export const runtime = "nodejs";

/** Ensure + return the public share URL for a lead. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await context.params;
  try {
    const listing = await ensurePublicListingPath(id);
    return NextResponse.json({
      publicCategorySlug: listing.publicCategorySlug,
      publicHandle: listing.publicHandle,
      path: listing.path,
      url: listing.url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not resolve listing.";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
