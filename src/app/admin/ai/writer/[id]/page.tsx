import Link from "next/link";
import { notFound } from "next/navigation";
import { getWriterRun } from "@/ai/writer";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function WriterRunDetailPage({ params }: PageProps) {
  const { id } = await params;
  const run = await getWriterRun(id);

  if (!run) {
    notFound();
  }

  const output = run.output as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          href="/admin/ai/writer"
          className="text-sm font-medium text-primary"
        >
          ← AI Writer
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">{run.keyword}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Run {run.id} · {run.status} · {run.model || "no model"}
        </p>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-slate-500">Started</dt>
            <dd className="font-medium text-slate-900">{formatDate(run.startedAt)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Completed</dt>
            <dd className="font-medium text-slate-900">{formatDate(run.completedAt)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Prompt version</dt>
            <dd className="font-medium text-slate-900">{run.promptVersion || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Content idea</dt>
            <dd className="font-medium text-slate-900">
              {run.contentIdea?.title || "—"}
            </dd>
          </div>
        </dl>
        {run.errorMessage ? (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {run.errorMessage}
          </p>
        ) : null}
        {run.blog ? (
          <div className="mt-4">
            <Link
              href={`/admin/blogs/${run.blog.id}/edit`}
              className="inline-flex rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white"
            >
              Edit draft in Blog CMS
            </Link>
          </div>
        ) : null}
      </header>

      {output ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Generated output</h2>
          <pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
            {JSON.stringify(output, null, 2)}
          </pre>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Input</h2>
        <pre className="mt-4 overflow-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
          {JSON.stringify(run.input, null, 2)}
        </pre>
      </section>
    </div>
  );
}
