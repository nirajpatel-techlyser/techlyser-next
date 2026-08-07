import Link from "next/link";
import WriterForm from "@/components/admin/ai/WriterForm";
import { listDraftContentIdeas, listWriterRuns } from "@/ai/writer";
import { hasLlmProvider } from "@/ai/writer/config";

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

export default async function AdminWriterPage() {
  const [runs, contentIdeas] = await Promise.all([
    listWriterRuns(25),
    listDraftContentIdeas(40),
  ]);

  const llmReady = hasLlmProvider();

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          AI Studio · Writer
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">AI Writer</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Generates SEO title, meta description, slug, outline, article body,
          FAQs, HowTo, comparison table, CTA, schema, TOC, reading time, and
          featured image prompt. Output is saved as a Blog draft only.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
          <span>
            LLM:{" "}
            <strong className={llmReady ? "text-emerald-700" : "text-amber-700"}>
              {llmReady ? "OpenAI configured" : "Template fallback (no API key)"}
            </strong>
          </span>
          <span>
            Recent runs:{" "}
            <strong className="text-slate-900">{runs.length}</strong>
          </span>
          <span>
            Planner ideas:{" "}
            <strong className="text-slate-900">{contentIdeas.length}</strong>
          </span>
        </div>
        <div className="mt-4">
          <Link href="/admin/ai" className="text-sm font-medium text-primary">
            ← AI Studio
          </Link>
        </div>
      </header>

      <WriterForm contentIdeas={contentIdeas} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent writer runs</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Keyword</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Model</th>
                <th className="px-2 py-2">Blog</th>
                <th className="px-2 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-b border-slate-100">
                  <td className="px-2 py-3">
                    <Link
                      href={`/admin/ai/writer/${run.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {run.keyword}
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-slate-600">{run.status}</td>
                  <td className="px-2 py-3 text-slate-600">{run.model || "—"}</td>
                  <td className="px-2 py-3 text-slate-600">
                    {run.blog ? (
                      <Link
                        href={`/admin/blogs/${run.blog.id}/edit`}
                        className="text-primary hover:underline"
                      >
                        {run.blog.status} · {run.blog.slug}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-2 py-3 text-slate-600">
                    {formatDate(run.createdAt)}
                  </td>
                </tr>
              ))}
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 py-6 text-slate-500">
                    No writer runs yet. Generate your first draft above.
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
