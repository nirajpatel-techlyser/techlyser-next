import Link from "next/link";
import RunAutopilotButton from "@/components/admin/ai/RunAutopilotButton";
import { isAutopilotEnabled, autopilotPublishEnabled } from "@/ai/autopilot/config";
import { resolveLlmProvider, getWriterModel } from "@/ai/writer/config";
import { prisma } from "@/lib/prisma";

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

export default async function AdminAutopilotPage() {
  const runs = await prisma.aiAgentRun.findMany({
    where: { workflowId: "daily-autopilot" },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  const enabled = isAutopilotEnabled();
  const autoPublish = autopilotPublishEnabled();
  const llmProvider = resolveLlmProvider();
  const llmModel = llmProvider ? getWriterModel(llmProvider) : null;

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          AI Studio · Autopilot
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Daily Autopilot</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Har din automatically: market research → opportunities → article draft
          (+ LinkedIn posts) → SEO + GEO. Featured images aap admin se upload
          karo. Default: <strong>DRAFT only</strong> — review karke publish karo.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
          <span>
            Status:{" "}
            <strong className={enabled ? "text-emerald-700" : "text-amber-700"}>
              {enabled ? "enabled" : "disabled"}
            </strong>
          </span>
          <span>
            LLM:{" "}
            <strong className={llmProvider ? "text-emerald-700" : "text-red-600"}>
              {llmProvider
                ? `${llmProvider} / ${llmModel}`
                : "not configured (set GEMINI_API_KEY)"}
            </strong>
          </span>
          <span>
            Publish:{" "}
            <strong className={autoPublish ? "text-amber-700" : "text-emerald-700"}>
              {autoPublish ? "auto (AI_AUTOPILOT_PUBLISH=true)" : "manual (DRAFT)"}
            </strong>
          </span>
          <span>
            Cron: <strong className="text-slate-900">03:30 UTC daily</strong>{" "}
            (9:00 AM IST)
          </span>
        </div>
        <div className="mt-5">
          <RunAutopilotButton />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          CLI: <code className="text-xs">npm run ai:daily</code> · Prefer{" "}
          <code className="text-xs">GEMINI_API_KEY</code> (free) — OpenAI not
          required. Images: upload in Blog edit.
        </p>
        <div className="mt-4">
          <Link href="/admin/ai" className="text-sm font-medium text-primary">
            ← AI Studio
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent autopilot runs</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Step</th>
                <th className="px-2 py-2">Created</th>
                <th className="px-2 py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-b border-slate-100">
                  <td className="px-2 py-3 text-slate-700">{run.status}</td>
                  <td className="px-2 py-3 text-slate-600">{run.currentStep || "—"}</td>
                  <td className="px-2 py-3 text-slate-600">{formatDate(run.createdAt)}</td>
                  <td className="px-2 py-3 text-slate-600">{run.errorMessage || "—"}</td>
                </tr>
              ))}
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-6 text-slate-500">
                    No autopilot runs yet.
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
