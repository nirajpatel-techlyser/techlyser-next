import DiscoverForm from "@/components/admin/business-opportunities/DiscoverForm";
import { listDiscoveryProviders } from "@/lib/business-discovery/providers/registry";

export default function BusinessOpportunitiesDiscoverPage() {
  const provider = listDiscoveryProviders()[0];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Discover</h2>
      <p className="mt-1 text-sm text-slate-600">
        Manual only — nothing auto-searches. Submit the form when you want to
        spend Neon CU-hours on a job.
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Choose country, cities, and categories, then pull public listings from{" "}
        {provider?.label || "the configured provider"}. Results open on Business
        Leads with PDF preview and email draft actions (no auto-send).
      </p>
      <div className="mt-6">
        <DiscoverForm providerLabel={provider?.label} />
      </div>
    </section>
  );
}
