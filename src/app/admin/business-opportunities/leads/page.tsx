import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BusinessLeadsBulkList, {
  type BulkLeadRow,
} from "@/components/admin/business-opportunities/BusinessLeadsBulkList";

export const dynamic = "force-dynamic";

export default async function BusinessOpportunityLeadsPage() {
  const total = await prisma.businessOpportunity.count();
  const leads = await prisma.businessOpportunity.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      businessName: true,
      category: true,
      city: true,
      countryName: true,
      address: true,
      phone: true,
      websiteUrl: true,
      websiteStatus: true,
      leadStatus: true,
      publicEmail: true,
      sourceUrl: true,
      createdAt: true,
      proposals: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, proposalStatus: true, pdfUrl: true },
      },
      outreach: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, approvalStatus: true, deliveryStatus: true },
      },
    },
  });

  const rows: BulkLeadRow[] = leads.map((lead) => ({
    id: lead.id,
    businessName: lead.businessName,
    category: lead.category,
    city: lead.city,
    countryName: lead.countryName,
    address: lead.address,
    phone: lead.phone,
    websiteUrl: lead.websiteUrl,
    websiteStatus: lead.websiteStatus,
    leadStatus: lead.leadStatus,
    publicEmail: lead.publicEmail,
    sourceUrl: lead.sourceUrl,
    proposalStatus: lead.proposals[0]?.proposalStatus || null,
    outreachLabel: lead.outreach[0]
      ? `${lead.outreach[0].approvalStatus}/${lead.outreach[0].deliveryStatus}`
      : null,
  }));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Business leads</h2>
          <p className="mt-1 text-sm text-slate-600">
            {total} stored opportunit{total === 1 ? "y" : "ies"}. Tick leads,
            then <span className="font-medium">Send WhatsApp</span> or{" "}
            <span className="font-medium">Send email</span> — each opens with
            that lead’s public concept link.
          </p>
        </div>
        <Link
          href="/admin/business-opportunities/discover"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800"
        >
          Discover
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">
          No business leads yet. Run Discover to query OpenStreetMap.
        </p>
      ) : (
        <BusinessLeadsBulkList leads={rows} />
      )}
    </section>
  );
}
