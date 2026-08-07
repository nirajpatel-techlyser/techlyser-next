import Link from "next/link";
import {
  Bot,
  Brain,
  CalendarRange,
  FileSearch,
  Globe2,
  LineChart,
  ListTodo,
  MessageSquareText,
  PenLine,
  Search,
  Sparkles,
} from "lucide-react";
import { AI_GROWTH_OS } from "@/ai/meta";
import { AI_MODULE_REGISTRY } from "@/ai/types";

const iconByModule = {
  agents: Bot,
  research: FileSearch,
  planner: ListTodo,
  writer: PenLine,
  seo: Search,
  geo: Globe2,
  analytics: LineChart,
  memory: Brain,
  prompts: MessageSquareText,
} as const;

export default function AdminAiStudioPage() {
  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              AI Studio · Phase {AI_GROWTH_OS.phase}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              {AI_GROWTH_OS.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Research → Opportunities → Planner → Writer → SEO/GEO are live.
              Writer and SEO engines save or update Blog drafts only — never
              auto-publish.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
            status: {AI_GROWTH_OS.status}
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <Link
            href="/admin/ai/planner"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 font-semibold text-white"
          >
            <CalendarRange className="h-4 w-4" aria-hidden />
            Open Content Planner
          </Link>
          <Link
            href="/admin/ai/writer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            <PenLine className="h-4 w-4" aria-hidden />
            Open AI Writer
          </Link>
          <Link
            href="/admin/ai/seo"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            <Search className="h-4 w-4" aria-hidden />
            Open SEO + GEO
          </Link>
          <Link
            href="/admin/ai/autopilot"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            Daily Autopilot
          </Link>
          <Link
            href="/admin/blogs"
            className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            Blog CMS
          </Link>
          <Link
            href="/admin/settings"
            className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            Site settings
          </Link>
        </div>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Module registry</h2>
        <p className="mt-1 text-sm text-slate-600">
          Source: <code className="text-xs">src/ai/types</code> · Docs:{" "}
          <code className="text-xs">src/ai/ARCHITECTURE.md</code>
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {AI_MODULE_REGISTRY.map((module) => {
            const Icon = iconByModule[module.id];
            return (
              <article
                key={module.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="rounded-xl bg-slate-100 p-2 text-slate-700">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{module.name}</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        phase {module.phase}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {module.responsibility}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
