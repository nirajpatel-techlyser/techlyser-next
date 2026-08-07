import Link from "next/link";
import SeoGeoForm from "@/components/admin/ai/SeoGeoForm";
import { listBlogsForSeo, listSeoGeoRuns } from "@/ai/seo";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminSeoPage() {
  const [blogs, runs] = await Promise.all([
    listBlogsForSeo(50),
    listSeoGeoRuns(25),
  ]);

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          AI Studio · SEO + GEO
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          SEO + GEO Engine
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Modular SEO (metadata, canonical, schema, internal links, headings,
          alt text, FAQ, Open Graph, Twitter, JSON-LD) plus GEO for ChatGPT,
          Gemini, Claude, Perplexity, AI Overviews, Knowledge Graph, and entity
          coverage. Never auto-publishes.
        </p>
        <div className="mt-4">
          <Link href="/admin/ai" className="text-sm font-medium text-primary">
            ← AI Studio
          </Link>
        </div>
      </header>

      <SeoGeoForm blogs={blogs} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent runs</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Blog</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">SEO</th>
                <th className="px-2 py-2">GEO</th>
                <th className="px-2 py-2">Applied</th>
                <th className="px-2 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-b border-slate-100">
                  <td className="px-2 py-3">
                    <Link
                      href={`/admin/ai/seo/${run.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {run.blog?.title || "Untitled run"}
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-slate-600">{run.status}</td>
                  <td className="px-2 py-3 text-slate-600">
                    {run.seoScore != null ? Math.round(run.seoScore) : "—"}
                  </td>
                  <td className="px-2 py-3 text-slate-600">
                    {run.geoScore != null ? Math.round(run.geoScore) : "—"}
                  </td>
                  <td className="px-2 py-3 text-slate-600">
                    {run.applied ? "yes" : "no"}
                  </td>
                  <td className="px-2 py-3 text-slate-600">
                    {formatDate(run.createdAt)}
                  </td>
                </tr>
              ))}
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 py-6 text-slate-500">
                    No SEO/GEO runs yet.
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
