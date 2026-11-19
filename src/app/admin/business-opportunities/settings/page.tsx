import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BusinessOpportunitySettingsPage() {
  const settings = await prisma.businessOpportunitySetting.findUnique({
    where: { id: "default" },
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
      <p className="mt-1 text-sm text-slate-600">
        Defaults for discovery and outreach. Editable settings UI expands in
        later stages.
      </p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Default sender
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">
            {settings?.defaultSenderEmail || "info@techlyser.com"}
          </dd>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Daily email quota
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">
            {settings?.dailyEmailQuota ?? 20}
          </dd>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Default provider
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">
            {settings?.defaultProvider || "manual"}
          </dd>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Settings row
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">
            {settings ? "Loaded" : "Not created yet (defaults shown)"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
