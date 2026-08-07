"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type BlogOption = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

type OptimizeReport = {
  runId: string;
  blogId?: string;
  applied: boolean;
  seo: {
    score: number;
    metadata: { seoTitle: string; seoDescription: string };
    canonical: { canonicalUrl: string };
    modules: string[];
    issues: string[];
  };
  geo: {
    score: number;
    entityCoverage: { covered: number; total: number; missing: string[] };
    engines: { engine: string; priority: string }[];
    citationSummary: string;
    modules: string[];
    issues: string[];
  };
};

export default function SeoGeoForm({ blogs }: { blogs: BlogOption[] }) {
  const router = useRouter();
  const [blogId, setBlogId] = useState(blogs[0]?.id || "");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [apply, setApply] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<OptimizeReport | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch("/api/ai/seo/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogId: blogId || undefined,
          primaryKeyword,
          apply,
        }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        report?: OptimizeReport;
      };
      if (!response.ok || !payload.success || !payload.report) {
        throw new Error(payload.error || "Optimize failed");
      }
      setReport(payload.report);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Optimize failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Blog</span>
            <select
              required
              value={blogId}
              onChange={(e) => setBlogId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {blogs.map((blog) => (
                <option key={blog.id} value={blog.id}>
                  [{blog.status}] {blog.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">
              Primary keyword
            </span>
            <input
              required
              value={primaryKeyword}
              onChange={(e) => setPrimaryKeyword(e.target.value)}
              placeholder="hire shopify developers india"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={apply}
              onChange={(e) => setApply(e.target.checked)}
              className="rounded border-slate-300"
            />
            Apply optimizations to Blog (never auto-publishes)
          </label>
        </div>

        <div className="mt-5">
          <button
            type="submit"
            disabled={loading || !blogId}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Optimizing…" : "Run SEO + GEO"}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </form>

      {report ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Optimization complete
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            SEO score {report.seo.score}/100 · GEO score {report.geo.score}/100
            {report.applied ? " · applied to blog" : " · preview only"}
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <h3 className="font-semibold text-slate-900">SEO</h3>
              <p className="mt-2 text-slate-700">{report.seo.metadata.seoTitle}</p>
              <p className="mt-1 text-slate-500">
                {report.seo.metadata.seoDescription}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Modules: {report.seo.modules.join(", ")}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <h3 className="font-semibold text-slate-900">GEO</h3>
              <p className="mt-2 text-slate-700">{report.geo.citationSummary}</p>
              <p className="mt-2 text-slate-600">
                Entities {report.geo.entityCoverage.covered}/
                {report.geo.entityCoverage.total}
                {report.geo.entityCoverage.missing.length
                  ? ` · missing: ${report.geo.entityCoverage.missing.slice(0, 3).join(", ")}`
                  : ""}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Engines:{" "}
                {report.geo.engines.map((e) => e.engine).join(", ")}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/admin/ai/seo/${report.runId}`}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            >
              View run details
            </Link>
            {report.blogId ? (
              <Link
                href={`/admin/blogs/${report.blogId}/edit`}
                className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white"
              >
                Edit blog
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
