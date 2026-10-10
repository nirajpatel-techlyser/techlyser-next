"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LIFECYCLE_LABEL } from "@/social/labels";
import type { SocialPlatform, SocialPublishView } from "@/social/types";

function badgeClass(status: string) {
  if (status === "PUBLISHED") return "bg-emerald-50 text-emerald-700";
  if (status === "PARTIALLY_PUBLISHED" || status === "PUBLISHING") return "bg-sky-50 text-sky-700";
  if (status === "PUBLISH_FAILED" || status === "FAILED") return "bg-red-50 text-red-700";
  if (status === "READY_TO_PUBLISH" || status === "APPROVED") return "bg-violet-50 text-violet-700";
  return "bg-amber-50 text-amber-800";
}

export default function SocialPublishPanel({ initial }: { initial: SocialPublishView }) {
  const router = useRouter();
  const [view, setView] = useState(initial);
  const [selected, setSelected] = useState<SocialPlatform[]>(
    initial.platforms.filter((platform) => platform.connected).map((platform) => platform.platform),
  );
  const [preview, setPreview] = useState<SocialPlatform | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const reasons = collectReasons(view, selected);
  const previewRow = view.platforms.find((platform) => platform.platform === preview) || null;

  async function approve() {
    setBusy(true);
    setNote(null);
    const response = await fetch(`/api/admin/social/posts/${view.blogId}/approve`, { method: "POST" });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setNote(data.error || "Approval failed.");
      return;
    }
    setView(data);
    setNote("Post approved for social publishing.");
    router.refresh();
  }

  async function publish() {
    setBusy(true);
    setNote(null);
    const response = await fetch(`/api/admin/social/posts/${view.blogId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platforms: selected }),
    });
    const data = await response.json();
    if (data.view) setView(data.view);
    if (!response.ok) {
      setBusy(false);
      setNote(data.error || "Publishing could not start.");
      return;
    }
    if (response.status === 200) {
      setNote("Platforms that already published this version were left untouched.");
    }
    if (data.jobId && response.status === 202) await watchJob(data.jobId);
    setBusy(false);
    router.refresh();
  }

  async function watchJob(jobId: string) {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const response = await fetch(`/api/admin/social/jobs/${jobId}`);
      if (!response.ok) return;
      const job = await response.json();
      setView((current) => ({
        ...current,
        lifecycle: job.lifecycle || current.lifecycle,
        activeJobId: job.status === "QUEUED" || job.status === "RUNNING" ? job.id : null,
        platforms: current.platforms.map((platform) => {
          const match = job.attempts?.find(
            (row: { platform: SocialPlatform }) => row.platform === platform.platform,
          );
          return match ? { ...platform, attempt: { ...platform.attempt, ...match } } : platform;
        }),
      }));
      if (job.status !== "QUEUED" && job.status !== "RUNNING") return;
    }
  }

  async function retry(attemptId: string) {
    setBusy(true);
    setNote(null);
    const response = await fetch(`/api/admin/social/attempts/${attemptId}/retry`, { method: "POST" });
    const data = await response.json();
    setBusy(false);
    if (data.view) setView(data.view);
    if (!response.ok) setNote(data.error || "Retry failed.");
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Publish Everywhere</h2>
          <p className="mt-1 text-sm text-slate-500">
            The website post stays the source. Social captions are adapted from it and stored separately.
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(view.lifecycle)}`}>
          {LIFECYCLE_LABEL[view.lifecycle] || view.lifecycle}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {view.platforms.map((platform) => (
          <div key={platform.platform} className="rounded-xl border border-slate-200 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={selected.includes(platform.platform)}
                  onChange={(event) => {
                    setSelected((current) =>
                      event.target.checked
                        ? [...current, platform.platform]
                        : current.filter((item) => item !== platform.platform),
                    );
                  }}
                />
                {platform.label}
              </label>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className={platform.connected ? "text-emerald-700" : "text-slate-500"}>
                  {platform.connected ? `Connected · ${platform.accountLabel}` : "Not connected"}
                </span>
                <AttemptStatus attempt={platform.attempt} />
                <button
                  type="button"
                  onClick={() => setPreview(platform.platform)}
                  className="font-semibold text-primary hover:underline"
                >
                  Preview
                </button>
                {platform.attempt?.status === "FAILED" ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => retry(platform.attempt!.id)}
                    className="font-semibold text-slate-800 hover:underline disabled:opacity-50"
                  >
                    Retry {platform.label}
                  </button>
                ) : null}
              </div>
            </div>
            {platform.attempt?.errorMessage ? (
              <p className="mt-2 text-sm text-red-700">{platform.attempt.errorMessage}</p>
            ) : null}
            {platform.attempt?.publishedUrl ? (
              <a
                href={platform.attempt.publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
              >
                View published post
              </a>
            ) : null}
          </div>
        ))}
      </div>

      {previewRow ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {previewRow.label} preview
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{previewRow.caption}</p>
          {previewRow.imageUrl ? (
            <p className="mt-2 text-xs text-slate-500">Image: {previewRow.imageUrl}</p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">No public https image on this post.</p>
          )}
        </div>
      ) : null}

      {reasons.length > 0 ? (
        <ul className="mt-4 space-y-1 text-sm text-amber-800">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : null}
      {note ? <p className="mt-3 text-sm text-slate-700">{note}</p> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || view.approved}
          onClick={approve}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        >
          {view.approved ? "Approved" : "Approve"}
        </button>
        <button
          type="button"
          disabled={busy || reasons.length > 0}
          onClick={publish}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {busy ? "Publishing…" : "Publish Everywhere"}
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Save the post after editing the text or image. Publishing uses the saved website post and does not post by itself.
      </p>
    </section>
  );
}

function AttemptStatus({
  attempt,
}: {
  attempt: SocialPublishView["platforms"][number]["attempt"];
}) {
  if (!attempt) return <span className="text-slate-400">Not published</span>;
  if (attempt.status === "PUBLISHED") return <span className="text-emerald-700">Published</span>;
  if (attempt.status === "FAILED") return <span className="text-red-700">Failed</span>;
  if (attempt.status === "PUBLISHING" || attempt.status === "PENDING") {
    return <span className="text-sky-700">Publishing…</span>;
  }
  return <span className="text-slate-500">{attempt.status}</span>;
}

function collectReasons(view: SocialPublishView, selected: SocialPlatform[]) {
  const reasons: string[] = [];
  if (!view.websitePublished) {
    reasons.push("Publish the website post first so the social link is live.");
  }
  if (!view.approved) {
    reasons.push("Approve the post before publishing to social platforms.");
  }
  if (!view.platforms.some((platform) => platform.connected)) {
    reasons.push("Connect at least one social account.");
  }
  if (selected.length === 0) reasons.push("Select at least one platform.");
  for (const platform of selected) {
    const row = view.platforms.find((item) => item.platform === platform);
    if (row?.blockReason && !reasons.includes(row.blockReason)) reasons.push(row.blockReason);
  }
  return reasons;
}
