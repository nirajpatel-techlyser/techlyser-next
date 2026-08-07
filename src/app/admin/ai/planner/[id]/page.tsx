import Link from "next/link";
import { notFound } from "next/navigation";
import ActivatePlanButton from "@/components/admin/ai/ActivatePlanButton";
import { getContentPlanById } from "@/ai/planner";
import type { InternalLinkMap } from "@/ai/planner";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

function formatDate(value: Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function AdminPlanDetailPage({ params }: PageProps) {
  const { id } = await params;
  const plan = await getContentPlanById(id);
  if (!plan) notFound();

  const linkMap = (plan.linkMap || {
    hubs: [],
    nodes: [],
    edges: [],
  }) as InternalLinkMap;

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          href="/admin/ai/planner"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Planner
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {plan.horizon} · {plan.status}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{plan.name}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              {plan.summary}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {formatDate(plan.periodStart)} → {formatDate(plan.periodEnd)}
            </p>
          </div>
          {plan.status !== "ACTIVE" ? (
            <ActivatePlanButton planId={plan.id} />
          ) : (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
              Active
            </span>
          )}
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Planned items ({plan.items.length})
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Role</th>
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Scheduled</th>
                <th className="px-2 py-2">Cluster</th>
                <th className="px-2 py-2">Path</th>
              </tr>
            </thead>
            <tbody>
              {plan.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 align-top">
                  <td className="px-2 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        item.role === "PILLAR"
                          ? "bg-primary/10 text-primary"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.role}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    {item.angle ? (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {item.angle}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-2 py-3 text-slate-600">
                    {formatDate(item.scheduledFor)}
                  </td>
                  <td className="px-2 py-3 text-slate-600">
                    {item.cluster?.name || "—"}
                  </td>
                  <td className="px-2 py-3 text-slate-600">
                    {item.suggestedPath || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Link map nodes ({linkMap.nodes?.length || 0})
          </h2>
          <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto text-sm">
            {(linkMap.nodes || []).map((node) => (
              <li
                key={node.id}
                className="rounded-lg border border-slate-100 px-3 py-2"
              >
                <p className="font-medium text-slate-900">{node.title}</p>
                <p className="text-xs text-slate-500">
                  {node.role} · {node.path}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Link edges ({linkMap.edges?.length || 0})
          </h2>
          <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto text-sm">
            {(linkMap.edges || []).slice(0, 80).map((edge, index) => (
              <li
                key={`${edge.from}-${edge.to}-${index}`}
                className="rounded-lg border border-slate-100 px-3 py-2 text-slate-600"
              >
                <span className="font-medium text-slate-800">{edge.anchor}</span>
                <span className="mx-1 text-slate-400">·</span>
                {edge.reason}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            API:{" "}
            <code className="rounded bg-slate-50 px-1">
              /api/ai/planner/link-map/{plan.id}
            </code>
          </p>
        </div>
      </section>
    </div>
  );
}
