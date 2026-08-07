"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  WriterLength,
  WriterSearchIntent,
  WriterTone,
} from "@/ai/writer/types";

type ContentIdeaOption = {
  id: string;
  title: string;
  angle: string | null;
};

type WriterFormProps = {
  contentIdeas?: ContentIdeaOption[];
};

type GenerateReport = {
  runId: string;
  blogId: string;
  slug: string;
  seoTitle: string;
  readingTimeMinutes: number;
  output: {
    metaDescription: string;
    outline: string;
    featuredImagePrompt: string;
    faqs: { question: string; answer: string }[];
    schema: Record<string, unknown>[];
    toc: { id: string; text: string; level: number }[];
  };
};

const defaultForm = {
  keyword: "",
  audience: "ecommerce founders and marketing leaders",
  searchIntent: "informational" as WriterSearchIntent,
  category: "Shopify",
  tone: "premium" as WriterTone,
  length: "medium" as WriterLength,
  contentIdeaId: "",
};

export default function WriterForm({ contentIdeas = [] }: WriterFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<GenerateReport | null>(null);

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch("/api/ai/writer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          contentIdeaId: form.contentIdeaId || undefined,
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        report?: GenerateReport;
      };

      if (!response.ok || !payload.success || !payload.report) {
        throw new Error(payload.error || "Generation failed");
      }

      setReport(payload.report);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
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
            <span className="text-sm font-medium text-slate-700">Keyword</span>
            <input
              required
              value={form.keyword}
              onChange={(e) => updateField("keyword", e.target.value)}
              placeholder="hire shopify developers india"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Audience</span>
            <input
              required
              value={form.audience}
              onChange={(e) => updateField("audience", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Search intent
            </span>
            <select
              value={form.searchIntent}
              onChange={(e) =>
                updateField(
                  "searchIntent",
                  e.target.value as WriterSearchIntent,
                )
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="informational">Informational</option>
              <option value="commercial">Commercial</option>
              <option value="transactional">Transactional</option>
              <option value="navigational">Navigational</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <input
              required
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Tone</span>
            <select
              value={form.tone}
              onChange={(e) => updateField("tone", e.target.value as WriterTone)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="premium">Premium</option>
              <option value="practical">Practical</option>
              <option value="technical">Technical</option>
              <option value="friendly">Friendly</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Length</span>
            <select
              value={form.length}
              onChange={(e) =>
                updateField("length", e.target.value as WriterLength)
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="short">Short (~900 words)</option>
              <option value="medium">Medium (~1,500 words)</option>
              <option value="long">Long (~2,500 words)</option>
            </select>
          </label>

          {contentIdeas.length > 0 ? (
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                Link to content idea (optional)
              </span>
              <select
                value={form.contentIdeaId}
                onChange={(e) => updateField("contentIdeaId", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {contentIdeas.map((idea) => (
                  <option key={idea.id} value={idea.id}>
                    {idea.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Generating draft…" : "Generate & save draft"}
          </button>
          <p className="text-xs text-slate-500">
            Always saves as Blog DRAFT — never auto-publishes.
          </p>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </form>

      {report ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Draft created</h2>
          <dl className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500">SEO title</dt>
              <dd>{report.seoTitle}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Slug</dt>
              <dd>{report.slug}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Reading time</dt>
              <dd>{report.readingTimeMinutes} min</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Meta description</dt>
              <dd>{report.output.metaDescription}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/admin/blogs/${report.blogId}/edit`}
              className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white"
            >
              Edit in Blog CMS
            </Link>
            <Link
              href={`/admin/ai/writer/${report.runId}`}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            >
              View run details
            </Link>
          </div>

          <details className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-medium text-slate-800">
              Outline, FAQs, schema, image prompt
            </summary>
            <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-slate-600">
              {JSON.stringify(
                {
                  outline: report.output.outline,
                  faqs: report.output.faqs,
                  toc: report.output.toc,
                  schemaTypes: report.output.schema.map(
                    (s) => (s as { "@type"?: string })["@type"],
                  ),
                  featuredImagePrompt: report.output.featuredImagePrompt,
                },
                null,
                2,
              )}
            </pre>
          </details>
        </section>
      ) : null}
    </div>
  );
}
