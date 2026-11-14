"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

type AuditStatusResponse = {
  id: string;
  status: string;
  normalizedUrl: string;
  overallScore: number | null;
  categoryScores?: Array<{
    id: string;
    label: string;
    score: number | null;
    summary: string;
  }>;
  recommendations?: Array<{
    problemTitle: string;
    priority: string;
    recommendation: string;
    category: string;
  }>;
  previewFindings?: Array<{
    title: string;
    observation: string;
    recommendation: string;
    severity: string;
  }>;
  errorMessage?: string | null;
  job?: { step: string; progress: number } | null;
  emailSentAt?: string | null;
  hasLead?: boolean;
};

const STEP_LABELS: Record<string, string> = {
  queued: "Queued…",
  fetching: "Checking website availability…",
  analyzing: "Analyzing structure, SEO, UX and conversion signals…",
  generating_recommendations: "Preparing growth recommendations…",
  awaiting_email: "Report preview ready",
  generating_pdf: "Generating your PDF report…",
  sending_email: "Sending your report email…",
  completed: "Completed",
};

export default function WebsiteGrowthAuditWizard() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get("url")?.trim() || "";
  const autoStarted = useRef(false);

  const [url, setUrl] = useState(initialUrl);
  const [honeypot, setHoneypot] = useState("");
  const [auditId, setAuditId] = useState<string | null>(null);
  const [audit, setAudit] = useState<AuditStatusResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [consent, setConsent] = useState(false);
  const [doneMessage, setDoneMessage] = useState("");

  const progress = audit?.job?.progress ?? 0;
  const stepLabel = STEP_LABELS[audit?.job?.step || ""] || audit?.status || "";

  const canClaim = audit?.status === "AWAITING_EMAIL" || audit?.status === "COMPLETED";

  async function refresh(id: string) {
    const response = await fetch(`/api/website-growth-audit/${id}`);
    const data = (await response.json()) as AuditStatusResponse & { error?: string };
    if (!response.ok) throw new Error(data.error || "Could not load audit status");
    setAudit(data);
    return data;
  }

  async function advance(id: string) {
    const response = await fetch(`/api/website-growth-audit/${id}/advance`, {
      method: "POST",
    });
    const data = (await response.json()) as { success?: boolean; error?: string };
    if (!response.ok || data.success === false) {
      throw new Error(data.error || "Analysis failed");
    }
    return refresh(id);
  }

  async function startAudit(targetUrl: string) {
    setError("");
    setDoneMessage("");
    setAudit(null);
    setBusy(true);
    try {
      const response = await fetch("/api/website-growth-audit/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, website: honeypot }),
      });
      const data = (await response.json()) as {
        success?: boolean;
        auditId?: string;
        error?: string;
      };
      if (!response.ok || !data.auditId) {
        throw new Error(data.error || "Could not start audit");
      }
      setAuditId(data.auditId);
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Could not start audit");
    }
  }

  useEffect(() => {
    if (!auditId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function loop() {
      try {
        const current = await refresh(auditId!);
        if (cancelled) return;
        if (
          current.status === "PENDING" ||
          current.status === "FETCHING" ||
          current.status === "ANALYZING" ||
          current.status === "GENERATING_RECOMMENDATIONS"
        ) {
          await advance(auditId!);
          if (!cancelled) timer = setTimeout(loop, 1200);
          return;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Audit failed");
          setBusy(false);
        }
        return;
      }
      if (!cancelled) setBusy(false);
    }

    setBusy(true);
    loop();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [auditId]);

  useEffect(() => {
    if (!initialUrl || autoStarted.current) return;
    autoStarted.current = true;
    setUrl(initialUrl);
    void startAudit(initialUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start once from homepage strip query
  }, [initialUrl]);

  async function onStart(event: FormEvent) {
    event.preventDefault();
    await startAudit(url);
  }

  async function onClaim(event: FormEvent) {
    event.preventDefault();
    if (!auditId) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/website-growth-audit/${auditId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          companyName,
          consent: true,
          marketingConsent: false,
          website: honeypot,
        }),
      });
      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
        emailSent?: boolean;
        warning?: string;
      };
      if (!response.ok || data.success === false) {
        throw new Error(data.error || "Could not send report");
      }
      setDoneMessage(
        data.emailSent === false
          ? data.warning ||
              "Your report was prepared, but email delivery failed. Please try again shortly."
          : "Your report has been emailed. Check your inbox (and spam folder).",
      );
      await refresh(auditId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send report");
    } finally {
      setBusy(false);
    }
  }

  const exampleCategories = useMemo(
    () => [
      "SEO & Visibility",
      "Conversion Readiness",
      "UI/UX & Design",
      "Mobile Experience",
      "Performance",
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <form onSubmit={onStart} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <label className="block text-sm font-medium text-hero-fg">Website URL</label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="w-full rounded-[5px] border border-white/15 bg-black/20 px-4 py-3 text-sm text-hero-fg outline-none placeholder:text-hero-fg-muted focus:border-primary"
          />
          <button
            type="submit"
            disabled={busy}
            className="btn-brand inline-flex items-center justify-center gap-2 rounded-[5px] px-6 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {busy && !canClaim ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Analyze My Website
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />
        <p className="mt-3 text-xs text-hero-fg-muted">
          Public websites only. We never invent scores or rankings.
        </p>
      </form>

      {!auditId ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Example report categories
          </p>
          <p className="mt-2 text-sm text-hero-fg-muted">
            Illustrative only — not a real audit result.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {exampleCategories.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-hero-fg">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {auditId ? (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-hero-fg">Analysis progress</p>
              <p className="mt-1 text-xs text-hero-fg-muted">{stepLabel}</p>
            </div>
            <p className="text-sm font-semibold text-primary">{progress}%</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          {audit?.normalizedUrl ? (
            <p className="text-xs text-hero-fg-muted">Auditing: {audit.normalizedUrl}</p>
          ) : null}
        </div>
      ) : null}

      {audit && (audit.status === "AWAITING_EMAIL" || audit.status === "COMPLETED") ? (
        <div className="space-y-6 rounded-2xl border border-white/10 bg-white p-6 text-slate-900 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Your Website Growth Report Is Ready</h2>
            <p className="mt-2 text-sm text-slate-600">
              Preview below. Enter your business email to receive the personalized PDF report.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overall score</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {audit.overallScore == null ? "Insufficient data" : `${audit.overallScore}/100`}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categories</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {(audit.categoryScores || []).slice(0, 4).map((c) => (
                  <li key={c.id}>
                    {c.label}: {c.score == null ? "N/A" : `${c.score}/100`}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Sample findings</h3>
            <ul className="mt-3 space-y-3">
              {(audit.previewFindings || []).slice(0, 5).map((f) => (
                <li key={f.title} className="rounded-xl border border-slate-200 p-3 text-sm">
                  <p className="font-medium text-slate-900">{f.title}</p>
                  <p className="mt-1 text-slate-600">{f.observation}</p>
                </li>
              ))}
            </ul>
          </div>

          {audit.status !== "COMPLETED" || !audit.emailSentAt ? (
            <form onSubmit={onClaim} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name (optional)"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company (optional)"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Business email"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I agree to receive my requested website audit report from Techlyser.
                  Questions about how we use your details?{" "}
                  <a href="/contact" className="text-primary underline">
                    Contact us
                  </a>
                  .
                </span>
              </label>
              <button
                type="submit"
                disabled={busy || !consent}
                className="rounded-[5px] bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busy ? "Sending…" : "Email My Report"}
              </button>
            </form>
          ) : null}

          {doneMessage ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {doneMessage}
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
