import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BusinessOpportunityHistoryPage() {
  const jobs = await prisma.businessOpportunityJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      status: true,
      step: true,
      countryName: true,
      cities: true,
      categories: true,
      provider: true,
      discoveredCount: true,
      createdAt: true,
      completedAt: true,
      errorMessage: true,
    },
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Search history</h2>
      <p className="mt-1 text-sm text-slate-600">
        Discovery job log. Jobs are created when Stage 3 provider search runs.
      </p>

      {jobs.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">No search jobs yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100">
          {jobs.map((job) => (
            <li key={job.id} className="py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-900">
                  {job.countryName} · {job.cities.join(", ")}
                </p>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {job.status}
                </span>
              </div>
              <p className="mt-1 text-slate-600">
                {job.categories.join(", ")} · {job.provider} · discovered{" "}
                {job.discoveredCount} · {job.createdAt.toLocaleString()}
              </p>
              {job.errorMessage ? (
                <p className="mt-1 text-red-600">{job.errorMessage}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
