import Link from "next/link";
import GeneratePlansButton from "@/components/admin/ai/GeneratePlansButton";
import { listContentPlans, listPlannerClusters } from "@/ai/planner";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function AdminPlannerPage() {
  const [plans, clusters, opportunityCount] = await Promise.all([
    listContentPlans(40),
    listPlannerClusters(40),
    prisma.opportunity.count({
      where: { status: { in: ["NEW", "REVIEWED", "QUEUED"] } },
    }),
  ]);

  const byHorizon = {
    DAILY: plans.filter((p) => p.horizon === "DAILY"),
    WEEKLY: plans.filter((p) => p.horizon === "WEEKLY"),
    MONTHLY: plans.filter((p) => p.horizon === "MONTHLY"),
  };

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          AI Studio · Planner
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Content Planner
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Converts ranked opportunities into topic clusters, pillar + supporting
          articles, internal linking maps, and daily / weekly / monthly plans.
          No AI writing in this phase — titles, angles, and schedules only.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
          <span>
            Active opportunities:{" "}
            <strong className="text-slate-900">{opportunityCount}</strong>
          </span>
          <span>
            Clusters: <strong className="text-slate-900">{clusters.length}</strong>
          </span>
          <span>
            Plans: <strong className="text-slate-900">{plans.length}</strong>
          </span>
        </div>
        <div className="mt-5">
          <GeneratePlansButton />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Prerequisite: run research + opportunities engines so ranked
          opportunities exist.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((horizon) => (
          <div
            key={horizon}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              {horizon}
            </h2>
            <ul className="mt-4 space-y-3">
              {byHorizon[horizon].slice(0, 5).map((plan) => (
                <li key={plan.id}>
                  <Link
                    href={`/admin/ai/planner/${plan.id}`}
                    className="block rounded-xl border border-slate-100 p-3 transition hover:border-primary/30"
                  >
                    <p className="font-medium text-slate-900">{plan.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {plan.status} · {plan._count.items} items ·{" "}
                      {formatDate(plan.periodStart)} → {formatDate(plan.periodEnd)}
                    </p>
                  </Link>
                </li>
              ))}
              {byHorizon[horizon].length === 0 ? (
                <li className="text-sm text-slate-500">No plans yet.</li>
              ) : null}
            </ul>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Topic clusters</h2>
          <Link href="/admin/ai" className="text-sm font-medium text-primary">
            ← AI Studio
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Ideas</th>
                <th className="px-2 py-2">Pillar path</th>
              </tr>
            </thead>
            <tbody>
              {clusters.map((cluster) => (
                <tr key={cluster.id} className="border-b border-slate-100">
                  <td className="px-2 py-3 font-medium text-slate-900">
                    {cluster.name}
                  </td>
                  <td className="px-2 py-3 text-slate-600">{cluster.status}</td>
                  <td className="px-2 py-3 text-slate-600">
                    {cluster._count.ideas}
                  </td>
                  <td className="px-2 py-3 text-slate-600">
                    {cluster.pillarPath || "—"}
                  </td>
                </tr>
              ))}
              {clusters.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-6 text-slate-500">
                    No clusters yet. Generate a plan to create them.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
