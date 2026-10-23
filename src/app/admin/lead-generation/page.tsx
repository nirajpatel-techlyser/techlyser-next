import Link from "next/link";
import { LeadStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import DiscoverForm from "@/components/admin/leads/DiscoverForm";
import { googleCseConfigured } from "@/leads/providers";
import { LEAD_MARKETS, marketLabel } from "@/leads/markets";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const STATUSES = new Set<string>(Object.values(LeadStatus));

export default async function LeadGenerationPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; country?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const status = params.status && STATUSES.has(params.status) ? (params.status as LeadStatus) : undefined;
  const country = params.country || "";
  const page = Math.max(1, Number(params.page || "1") || 1);
  const where: Prisma.LeadWhereInput = {
    ...(status ? { status } : {}),
    ...(country ? { targetCountry: country } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { domain: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [counts, jobs, total, leads] = await Promise.all([
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.leadResearchJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, status: true, provider: true, targetCountry: true, niche: true, discoveredCount: true, errorMessage: true, createdAt: true },
    }),
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        domain: true,
        targetCountry: true,
        shopifyConfidence: true,
        score: true,
        status: true,
        source: true,
        publicEmail: true,
      },
    }),
  ]);

  const count = (value: LeadStatus) => counts.find((row) => row.status === value)?._count._all || 0;
  const totalLeads = counts.reduce((sum, row) => sum + row._count._all, 0);
  const exportQuery = new URLSearchParams();
  if (q) exportQuery.set("q", q);
  if (status) exportQuery.set("status", status);
  if (country) exportQuery.set("country", country);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Lead generation</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Research public Shopify stores in the United States, Canada, Australia, New Zealand, Denmark, and Europe.
          Messages are drafts only.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Discovered", totalLeads],
          ["Needs review", count("NEEDS_REVIEW") + count("DISCOVERED")],
          ["Qualified", count("QUALIFIED")],
          ["Contacted", count("CONTACTED") + count("REPLIED")],
          ["Converted", count("CONVERTED")],
        ].map(([label, value]) => (
          <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Discover</h2>
        <div className="mt-4">
          <DiscoverForm searchConfigured={googleCseConfigured()} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Recent research</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {jobs.length === 0 ? <li>No research runs yet.</li> : null}
          {jobs.map((job) => (
            <li key={job.id}>
              {job.status} · {marketLabel(job.targetCountry)} · {job.niche} · {job.provider} · {job.discoveredCount} saved
              {job.errorMessage ? ` · ${job.errorMessage}` : ""}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Leads</h2>
          <a className="text-sm font-semibold text-primary" href={`/api/admin/leads/export?${exportQuery.toString()}`}>
            Export CSV
          </a>
        </div>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input name="q" defaultValue={q} placeholder="Search name or domain" className="flex-1 rounded-xl border border-slate-200 px-3 py-2" />
          <select name="country" defaultValue={country} className="rounded-xl border border-slate-200 px-3 py-2">
            <option value="">All markets</option>
            {LEAD_MARKETS.map((market) => (
              <option key={market.id} value={market.id}>{market.label}</option>
            ))}
          </select>
          <select name="status" defaultValue={status || ""} className="rounded-xl border border-slate-200 px-3 py-2">
            <option value="">All statuses</option>
            {Object.values(LeadStatus).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Filter</button>
        </form>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-2 py-2">Business</th>
                <th className="px-2 py-2">Market</th>
                <th className="px-2 py-2">Shopify</th>
                <th className="px-2 py-2">Score</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-slate-100">
                  <td className="px-2 py-3">
                    <Link href={`/admin/lead-generation/${lead.id}`} className="font-semibold text-slate-900 hover:underline">
                      {lead.name}
                    </Link>
                    <p className="text-slate-500">{lead.domain}</p>
                  </td>
                  <td className="px-2 py-3">{marketLabel(lead.targetCountry)}</td>
                  <td className="px-2 py-3">{lead.shopifyConfidence}</td>
                  <td className="px-2 py-3">{lead.score}</td>
                  <td className="px-2 py-3">{lead.status}</td>
                </tr>
              ))}
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-slate-500">No leads for this filter.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Page {page} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}
        </p>
      </section>
    </div>
  );
}
