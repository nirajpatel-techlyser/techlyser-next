import Link from "next/link";
import { WebsiteAuditLeadStatus, WebsiteAuditStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;
const AUDIT_STATUSES = new Set<string>(Object.values(WebsiteAuditStatus));
const LEAD_STATUSES = new Set<string>(Object.values(WebsiteAuditLeadStatus));

export default async function WebsiteAuditsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; leadStatus?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const status =
    params.status && AUDIT_STATUSES.has(params.status)
      ? (params.status as WebsiteAuditStatus)
      : undefined;
  const leadStatus =
    params.leadStatus && LEAD_STATUSES.has(params.leadStatus)
      ? (params.leadStatus as WebsiteAuditLeadStatus)
      : undefined;
  const page = Math.max(1, Number(params.page || "1") || 1);

  const where: Prisma.WebsiteAuditWhereInput = {
    ...(status ? { status } : {}),
    ...(leadStatus ? { lead: { status: leadStatus } } : {}),
    ...(q
      ? {
          OR: [
            { normalizedUrl: { contains: q, mode: "insensitive" } },
            { websiteUrl: { contains: q, mode: "insensitive" } },
            { lead: { email: { contains: q, mode: "insensitive" } } },
            { lead: { companyName: { contains: q, mode: "insensitive" } } },
            { lead: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [statusCounts, leadCounts, total, audits] = await Promise.all([
    prisma.websiteAudit.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.websiteAuditLead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.websiteAudit.count({ where }),
    prisma.websiteAudit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        status: true,
        normalizedUrl: true,
        overallScore: true,
        emailSentAt: true,
        createdAt: true,
        lead: {
          select: {
            id: true,
            email: true,
            name: true,
            companyName: true,
            status: true,
          },
        },
      },
    }),
  ]);

  const auditCount = (value: WebsiteAuditStatus) =>
    statusCounts.find((row) => row.status === value)?._count._all || 0;
  const leadCount = (value: WebsiteAuditLeadStatus) =>
    leadCounts.find((row) => row.status === value)?._count._all || 0;
  const totalAudits = statusCounts.reduce((sum, row) => sum + row._count._all, 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exportQuery = new URLSearchParams();
  if (q) exportQuery.set("q", q);
  if (status) exportQuery.set("status", status);
  if (leadStatus) exportQuery.set("leadStatus", leadStatus);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Website Growth Audits</h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Inbound audits from{" "}
            <Link href="/website-growth-audit" className="font-semibold text-primary">
              /website-growth-audit
            </Link>
            . Follow up on claimed reports and review technical scores.
          </p>
        </div>
        <a
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-primary"
          href={`/api/admin/website-audits/export?${exportQuery.toString()}`}
        >
          Export CSV
        </a>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Total audits", totalAudits],
          ["Awaiting email", auditCount("AWAITING_EMAIL")],
          ["Completed", auditCount("COMPLETED")],
          ["Failed", auditCount("FAILED")],
          ["New leads", leadCount("NEW")],
        ].map(([label, value]) => (
          <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <form className="flex flex-wrap gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search URL, email, company…"
            className="min-w-[220px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <select
            name="status"
            defaultValue={status || ""}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All audit statuses</option>
            {[...AUDIT_STATUSES].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            name="leadStatus"
            defaultValue={leadStatus || ""}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All lead statuses</option>
            {[...LEAD_STATUSES].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Filter
          </button>
        </form>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-3">Website</th>
                <th className="px-2 py-3">Score</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Lead</th>
                <th className="px-2 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {audits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 py-8 text-slate-500">
                    No audits yet.
                  </td>
                </tr>
              ) : null}
              {audits.map((audit) => (
                <tr key={audit.id} className="border-b border-slate-100">
                  <td className="px-2 py-3">
                    <Link
                      href={`/admin/website-audits/${audit.id}`}
                      className="font-semibold text-primary"
                    >
                      {audit.normalizedUrl}
                    </Link>
                  </td>
                  <td className="px-2 py-3">
                    {audit.overallScore == null ? "—" : `${audit.overallScore}/100`}
                  </td>
                  <td className="px-2 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {audit.status}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-slate-700">
                    {audit.lead ? (
                      <>
                        {audit.lead.email}
                        <span className="mt-1 block text-xs text-slate-500">
                          {audit.lead.status}
                          {audit.lead.companyName ? ` · ${audit.lead.companyName}` : ""}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400">No email yet</span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-slate-500">
                    {audit.createdAt.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <p>
              Page {page} of {totalPages} · {total} results
            </p>
            <div className="flex gap-3">
              {page > 1 ? (
                <Link
                  href={`/admin/website-audits?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(status ? { status } : {}),
                    ...(leadStatus ? { leadStatus } : {}),
                    page: String(page - 1),
                  }).toString()}`}
                  className="font-semibold text-primary"
                >
                  Previous
                </Link>
              ) : null}
              {page < totalPages ? (
                <Link
                  href={`/admin/website-audits?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(status ? { status } : {}),
                    ...(leadStatus ? { leadStatus } : {}),
                    page: String(page + 1),
                  }).toString()}`}
                  className="font-semibold text-primary"
                >
                  Next
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
