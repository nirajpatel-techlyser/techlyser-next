import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LeadActions from "@/components/admin/leads/LeadActions";
import { marketLabel } from "@/leads/markets";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      profiles: { orderBy: { platform: "asc" } },
      drafts: { orderBy: { createdAt: "desc" }, take: 9 },
    },
  });
  if (!lead) notFound();
  const facts = Array.isArray(lead.observedFacts) ? lead.observedFacts : [];
  const hypotheses = Array.isArray(lead.hypotheses) ? lead.hypotheses : [];
  const evidence = Array.isArray(lead.shopifyEvidence) ? lead.shopifyEvidence : [];

  return (
    <div className="space-y-6">
      <Link href="/admin/lead-generation" className="text-sm font-semibold text-primary">
        ← Lead generation
      </Link>
      <header className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-3xl font-bold text-slate-900">{lead.name}</h1>
        <p className="mt-2 text-slate-600">
          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary">
            {lead.website}
          </a>
          {" · "}
          {marketLabel(lead.targetCountry)}
          {lead.countryCode ? ` · observed ${lead.countryCode}` : " · country not observed on the page"}
          {" · score "}
          {lead.score}
          {" · "}
          {lead.status}
        </p>
        {lead.publicEmail ? <p className="mt-2 text-sm text-slate-700">Public email: {lead.publicEmail}</p> : null}
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Observed facts</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {facts.map((fact) => (
              <li key={String(fact)}>{String(fact)}</li>
            ))}
          </ul>
          <h3 className="mt-5 font-semibold text-slate-900">Hypotheses</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {hypotheses.length === 0 ? <li>None. Missing measurements were not invented.</li> : null}
            {hypotheses.map((item) => (
              <li key={String(item)}>{String(item)}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-600">{lead.scoreExplanation}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Shopify evidence</h2>
          <p className="mt-2 text-sm text-slate-600">Confidence: {lead.shopifyConfidence}</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {evidence.map((item) => (
              <li key={String(item)}>{String(item)}</li>
            ))}
          </ul>
          <h3 className="mt-5 font-semibold text-slate-900">Social profiles</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {lead.profiles.length === 0 ? <li className="text-slate-500">No profile link was published on the website.</li> : null}
            {lead.profiles.map((profile) => (
              <li key={profile.id}>
                <a href={profile.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary">
                  {profile.platform}
                </a>
                {" · "}
                {profile.verification}
                <p className="text-slate-500">{profile.evidence}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-600">
            Services: {lead.recommendedServices.join(", ") || "None"}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Review</h2>
        <div className="mt-4">
          <LeadActions leadId={lead.id} status={lead.status} notes={lead.notes || ""} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Outreach drafts</h2>
        <p className="mt-1 text-sm text-slate-500">Saved here only. Nothing is sent.</p>
        <ul className="mt-4 space-y-4">
          {lead.drafts.map((draft) => (
            <li key={draft.id} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">{draft.channel}</p>
              <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{draft.body}</pre>
            </li>
          ))}
          {lead.drafts.length === 0 ? <li className="text-sm text-slate-500">No drafts yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
