import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/ai-api-auth";
import { prisma } from "@/lib/prisma";
import {
  buildMailtoLink,
  buildOpportunityEmailDraft,
  buildWhatsAppDeepLink,
  normalizeWhatsAppPhone,
} from "@/lib/business-discovery/outreach-draft";
import { ensurePublicListingPath } from "@/lib/business-website-generator/public-listing";

export const runtime = "nodejs";

const MAX_IDS = 40;

type BulkItem = {
  id: string;
  businessName: string;
  phone: string | null;
  publicEmail: string | null;
  publicListingUrl: string;
  whatsappBody: string;
  whatsappUrl: string | null;
  emailSubject: string;
  emailBody: string;
  mailtoUrl: string | null;
  skipWhatsApp?: string;
  skipEmail?: string;
};

/** Prepare WhatsApp + email share payloads for selected leads (no auto-send). */
export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const body = (await request.json().catch(() => ({}))) as {
    ids?: string[];
  };
  const ids = Array.from(
    new Set((body.ids || []).map((id) => id.trim()).filter(Boolean)),
  ).slice(0, MAX_IDS);

  if (ids.length === 0) {
    return NextResponse.json(
      { error: "Select at least one lead." },
      { status: 400 },
    );
  }

  const businesses = await prisma.businessOpportunity.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      businessName: true,
      city: true,
      countryName: true,
      countryCode: true,
      category: true,
      publicEmail: true,
      phone: true,
      websiteUrl: true,
    },
  });

  const byId = new Map(businesses.map((b) => [b.id, b]));
  const items: BulkItem[] = [];

  for (const id of ids) {
    const business = byId.get(id);
    if (!business) continue;

    const listing = await ensurePublicListingPath(business.id);
    const draft = buildOpportunityEmailDraft({
      ...business,
      publicListingUrl: listing.url,
    });

    const phoneDigits = normalizeWhatsAppPhone(
      business.phone,
      business.countryCode,
    );
    const whatsappUrl = phoneDigits
      ? buildWhatsAppDeepLink(phoneDigits, draft.whatsappBody)
      : null;

    const email = (business.publicEmail || "").trim();
    const mailtoUrl =
      email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? buildMailtoLink({
            to: email,
            subject: draft.subject,
            body: draft.emailBody,
          })
        : null;

    items.push({
      id: business.id,
      businessName: business.businessName,
      phone: business.phone,
      publicEmail: business.publicEmail,
      publicListingUrl: listing.url,
      whatsappBody: draft.whatsappBody,
      whatsappUrl,
      emailSubject: draft.subject,
      emailBody: draft.emailBody,
      mailtoUrl,
      skipWhatsApp: whatsappUrl
        ? undefined
        : "No usable phone number for WhatsApp",
      skipEmail: mailtoUrl ? undefined : "No public email on listing",
    });
  }

  return NextResponse.json({
    count: items.length,
    items,
    note: "Opens WhatsApp / mail drafts with each lead’s public concept link. Nothing is auto-sent from the server.",
  });
}
