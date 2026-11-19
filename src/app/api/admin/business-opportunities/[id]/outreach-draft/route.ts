import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { prisma } from "@/lib/prisma";
import { buildOpportunityEmailDraft } from "@/lib/business-discovery/outreach-draft";
import { ensurePublicListingPath } from "@/lib/business-website-generator/public-listing";

export const runtime = "nodejs";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Create or refresh an email draft. Never sends. */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    recipientEmail?: string | null;
  };

  const business = await prisma.businessOpportunity.findUnique({
    where: { id },
    select: {
      id: true,
      businessName: true,
      city: true,
      countryName: true,
      category: true,
      publicEmail: true,
      phone: true,
      websiteUrl: true,
    },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  const listing = await ensurePublicListingPath(business.id);
  const draft = buildOpportunityEmailDraft({
    ...business,
    publicListingUrl: listing.url,
  });
  const manual = body.recipientEmail?.trim() || "";
  const recipient =
    (manual && isValidEmail(manual) ? manual : "") ||
    (business.publicEmail && isValidEmail(business.publicEmail)
      ? business.publicEmail
      : "");

  if (!recipient) {
    return NextResponse.json({
      saved: false,
      draft: {
        ...draft,
        recipientEmail: "",
      },
      note: "No public email on this listing (common with OpenStreetMap). Add a recipient email to save the draft. Nothing was sent.",
    });
  }

  const outreach = await prisma.businessOutreach.create({
    data: {
      businessOpportunityId: business.id,
      recipientEmail: recipient,
      senderEmail: draft.senderEmail,
      subject: draft.subject,
      emailBody: draft.emailBody,
      approvalStatus: "DRAFT",
      deliveryStatus: "DRAFT",
    },
    select: {
      id: true,
      recipientEmail: true,
      senderEmail: true,
      subject: true,
      emailBody: true,
      approvalStatus: true,
      deliveryStatus: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    saved: true,
    outreach,
    note: "Draft saved only. Email was not sent.",
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const { id } = await context.params;
  const business = await prisma.businessOpportunity.findUnique({
    where: { id },
    select: {
      id: true,
      businessName: true,
      city: true,
      countryName: true,
      category: true,
      publicEmail: true,
      phone: true,
      websiteUrl: true,
      outreach: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          recipientEmail: true,
          senderEmail: true,
          subject: true,
          emailBody: true,
          approvalStatus: true,
          deliveryStatus: true,
          createdAt: true,
        },
      },
      proposals: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          proposalStatus: true,
          pdfUrl: true,
          generatedAt: true,
        },
      },
    },
  });
  if (!business) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  const latestOutreach = business.outreach[0] || null;
  const latestProposal = business.proposals[0] || null;
  const listing = await ensurePublicListingPath(business.id);
  const previewDraft = buildOpportunityEmailDraft({
    businessName: business.businessName,
    city: business.city,
    countryName: business.countryName,
    category: business.category,
    publicEmail: business.publicEmail,
    phone: business.phone,
    websiteUrl: business.websiteUrl,
    publicListingUrl: listing.url,
  });

  return NextResponse.json({
    businessId: business.id,
    latestProposal,
    publicListingUrl: listing.url,
    publicListingPath: listing.path,
    draft: latestOutreach
      ? {
          ...latestOutreach,
          publicListingUrl: listing.url,
          whatsappBody: previewDraft.whatsappBody,
        }
      : {
          ...previewDraft,
          approvalStatus: "DRAFT",
          deliveryStatus: "DRAFT",
          id: null,
          createdAt: null,
        },
  });
}
