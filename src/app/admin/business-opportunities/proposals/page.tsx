import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BusinessOpportunityProposalsPage() {
  const proposals = await prisma.businessProposal.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    select: {
      id: true,
      proposalStatus: true,
      generatedAt: true,
      conceptId: true,
      pdfBase64: true,
      business: {
        select: { id: true, businessName: true, city: true, category: true },
      },
    },
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">PDF proposals</h2>
      <p className="mt-1 text-sm text-slate-600">
        Screenshot-driven agency proposals linked to website concepts.
      </p>

      {proposals.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">
          No proposals yet. Generate a concept, capture screenshots, then
          Generate PDF in the website studio.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100">
          {proposals.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {row.business.businessName}
                </p>
                <p className="text-slate-600">
                  {row.business.category} · {row.business.city} ·{" "}
                  {row.proposalStatus}
                  {row.generatedAt
                    ? ` · ${row.generatedAt.toLocaleString()}`
                    : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/business-opportunities/concepts/${row.business.id}`}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                >
                  Studio
                </Link>
                {row.pdfBase64 ? (
                  <a
                    href={`/api/admin/business-opportunities/${row.business.id}/proposal-pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Open PDF
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
