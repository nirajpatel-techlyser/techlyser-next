import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WebsiteAuditLeadActions from "@/components/admin/website-audits/WebsiteAuditLeadActions";
import type { AiRecommendation, AuditFinding, CategoryScore } from "@/website-audit/types";

export const dynamic = "force-dynamic";

export default async function WebsiteAuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const audit = await prisma.websiteAudit.findUnique({
    where: { id },
    include: {
      lead: true,
      jobs: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });
  if (!audit) notFound();

  const categoryScores = (Array.isArray(audit.categoryScores)
    ? audit.categoryScores
    : []) as CategoryScore[];
  const findings = ((audit.technicalFindings as { findings?: AuditFinding[] } | null)
    ?.findings || []) as AuditFinding[];
  const recommendations = (Array.isArray(audit.aiRecommendations)
    ? audit.aiRecommendations
    : []) as AiRecommendation[];
  const pages = (Array.isArray(audit.pagesAnalyzed) ? audit.pagesAnalyzed : []) as Array<{
    url: string;
    title?: string | null;
    status?: string;
  }>;

  return (
    <div className="space-y-6">
      <Link href="/admin/website-audits" className="text-sm font-semibold text-primary">
        ← Website audits
      </Link>

      <header className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {audit.normalizedUrl}
        </h1>
        <p className="mt-2 text-slate-600">
          {audit.status}
          {" · score "}
          {audit.overallScore == null ? "N/A" : `${audit.overallScore}/100`}
          {" · "}
          {audit.checksPerformed} checks · {audit.checksUnavailable} unavailable
          {audit.emailSentAt
            ? ` · emailed ${audit.emailSentAt.toLocaleString("en-IN")}`
            : ""}
        </p>
        {audit.errorMessage ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {audit.errorMessage}
          </p>
        ) : null}
        {audit.emailError ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Email error: {audit.emailError}
          </p>
        ) : null}
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Lead</h2>
          {audit.lead ? (
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>{audit.lead.email}</p>
              {audit.lead.name ? <p>Name: {audit.lead.name}</p> : null}
              {audit.lead.companyName ? <p>Company: {audit.lead.companyName}</p> : null}
              <p>Status: {audit.lead.status}</p>
              <p className="text-slate-500">
                Consent: {audit.lead.consentAt?.toLocaleString("en-IN") || "—"}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Visitor has not claimed the report yet.</p>
          )}
          {audit.lead ? (
            <div className="mt-5">
              <WebsiteAuditLeadActions
                leadId={audit.lead.id}
                status={audit.lead.status}
                notes={audit.lead.notes || ""}
              />
            </div>
          ) : null}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Category scores</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {categoryScores.length === 0 ? <li>No scores yet.</li> : null}
            {categoryScores.map((c) => (
              <li key={c.id} className="flex justify-between gap-3 border-b border-slate-100 py-2">
                <span>{c.label}</span>
                <span className="font-medium">
                  {c.score == null ? "N/A" : `${c.score}/100`}
                </span>
              </li>
            ))}
          </ul>
          <h3 className="mt-5 font-semibold text-slate-900">Pages analyzed</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {pages.length === 0 ? <li>None</li> : null}
            {pages.map((page) => (
              <li key={page.url}>
                {page.status || "ok"} · {page.url}
              </li>
            ))}
          </ul>
          <h3 className="mt-5 font-semibold text-slate-900">Jobs</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {audit.jobs.map((job) => (
              <li key={job.id}>
                {job.status} · {job.step} · {job.progress}%
                {job.errorMessage ? ` · ${job.errorMessage}` : ""}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Findings</h2>
        <ul className="mt-4 space-y-3">
          {findings.slice(0, 40).map((f) => (
            <li key={f.id} className="rounded-xl border border-slate-200 p-4 text-sm">
              <p className="font-medium text-slate-900">
                [{f.severity}] {f.title}
              </p>
              <p className="mt-1 text-slate-600">{f.observation}</p>
              <p className="mt-1 text-xs text-slate-500">
                {f.confidence} · {f.passed ? "passed" : "opportunity"} · impact {f.scoreImpact}
              </p>
            </li>
          ))}
          {findings.length === 0 ? (
            <li className="text-sm text-slate-500">No findings stored.</li>
          ) : null}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Recommendations</h2>
        <ul className="mt-4 space-y-3">
          {recommendations.map((r, index) => (
            <li key={`${r.problemTitle}-${index}`} className="rounded-xl bg-slate-50 p-4 text-sm">
              <p className="font-medium text-slate-900">
                {r.priority}: {r.problemTitle}
              </p>
              <p className="mt-1 text-slate-700">{r.recommendation}</p>
              <p className="mt-1 text-xs text-slate-500">
                {r.category} · {r.confidence}
              </p>
            </li>
          ))}
          {recommendations.length === 0 ? (
            <li className="text-sm text-slate-500">No recommendations yet.</li>
          ) : null}
        </ul>
      </section>

      {audit.reportHtml ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Report HTML preview</h2>
          <div
            className="mt-4 max-h-[480px] overflow-auto rounded-xl border border-slate-100 bg-white p-4 text-sm"
            dangerouslySetInnerHTML={{ __html: audit.reportHtml }}
          />
        </section>
      ) : null}
    </div>
  );
}
