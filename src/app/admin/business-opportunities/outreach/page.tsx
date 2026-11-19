import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BusinessOpportunityOutreachPage() {
  const drafts = await prisma.businessOutreach.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    select: {
      id: true,
      recipientEmail: true,
      subject: true,
      approvalStatus: true,
      deliveryStatus: true,
      createdAt: true,
      business: { select: { businessName: true, city: true } },
    },
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Email campaigns</h2>
      <p className="mt-2 text-sm text-slate-600">
        Drafts only for now. Sending from info@techlyser.com stays off until PDF
        design is finalized and Stage 9 approval is enabled.
      </p>

      {drafts.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">
          No drafts yet. Open a business lead and use{" "}
          <span className="font-medium">Save email body</span>.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100">
          {drafts.map((row) => (
            <li key={row.id} className="py-3 text-sm">
              <p className="font-medium text-slate-900">
                {row.business.businessName} · {row.business.city}
              </p>
              <p className="mt-1 text-slate-600">
                {row.subject} → {row.recipientEmail}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {row.approvalStatus} / {row.deliveryStatus} ·{" "}
                {row.createdAt.toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
