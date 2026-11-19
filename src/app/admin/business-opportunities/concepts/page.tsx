import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BusinessOpportunityConceptsPage() {
  const concepts = await prisma.businessWebsiteConcept.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      conceptTitle: true,
      generationStatus: true,
      previewScreenshotUrl: true,
      createdAt: true,
      business: {
        select: {
          id: true,
          businessName: true,
          category: true,
          city: true,
        },
      },
    },
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Website concepts</h2>
      <p className="mt-1 text-sm text-slate-600">
        Category-specific AI landing pages. Open a concept to preview desktop /
        mobile and generate the agency PDF.
      </p>

      {concepts.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">
          No concepts yet. Open a business lead and use{" "}
          <span className="font-medium">Generate Website Design</span>.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100">
          {concepts.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-slate-900">
                  {row.business.businessName}
                </p>
                <p className="text-sm text-slate-600">
                  {row.conceptTitle} · {row.business.category} ·{" "}
                  {row.business.city} · {row.generationStatus}
                </p>
              </div>
              <Link
                href={`/admin/business-opportunities/concepts/${row.business.id}`}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold"
              >
                Open studio
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
