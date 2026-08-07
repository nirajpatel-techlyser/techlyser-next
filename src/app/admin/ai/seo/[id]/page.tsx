import Link from "next/link";
import { notFound } from "next/navigation";
import { getSeoGeoRun } from "@/ai/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SeoGeoRunDetailPage({ params }: PageProps) {
  const { id } = await params;
  const run = await getSeoGeoRun(id);
  if (!run) notFound();

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link href="/admin/ai/seo" className="text-sm font-medium text-primary">
          ← SEO + GEO
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          {run.blog?.title || "SEO/GEO run"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {run.status} · SEO {run.seoScore ?? "—"} · GEO {run.geoScore ?? "—"} ·
          applied: {run.applied ? "yes" : "no"}
        </p>
        {run.blog ? (
          <Link
            href={`/admin/blogs/${run.blog.id}/edit`}
            className="mt-4 inline-flex rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white"
          >
            Edit blog
          </Link>
        ) : null}
        {run.errorMessage ? (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {run.errorMessage}
          </p>
        ) : null}
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">SEO output</h2>
        <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
          {JSON.stringify(run.seoOutput, null, 2)}
        </pre>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">GEO output</h2>
        <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
          {JSON.stringify(run.geoOutput, null, 2)}
        </pre>
      </section>
    </div>
  );
}
