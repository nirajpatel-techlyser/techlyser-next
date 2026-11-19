import { NextResponse } from "next/server";
import {
  isKnownPublicCategorySlug,
  resolvePublicListing,
} from "@/lib/business-website-generator/public-listing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public lead landing: /{slug}/{handle}
 * `slug` must match the root `[slug]` segment name (blog pages).
 * Only known business-category slugs match; others 404.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string; handle: string }> },
) {
  const { slug: categorySlug, handle } = await context.params;
  const slug = (categorySlug || "").trim().toLowerCase();
  const publicHandle = (handle || "").trim().toLowerCase();

  if (!slug || !publicHandle || !isKnownPublicCategorySlug(slug)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const listing = await resolvePublicListing(slug, publicHandle);
  if (!listing) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(listing.html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "X-Robots-Tag": "index, follow",
    },
  });
}
