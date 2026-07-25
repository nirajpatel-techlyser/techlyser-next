"use client";

import { FormEvent, useState, useTransition } from "react";
import { submitComment } from "@/actions/comments";

type BlogCommentsProps = {
  blogId: string;
  comments: Array<{
    id: string;
    name: string;
    content: string;
    createdAt: string;
  }>;
};

export default function BlogComments({ blogId, comments }: BlogCommentsProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    startTransition(async () => {
      const result = await submitComment({ blogId, name, email, content });
      if (!result.success) {
        setError(result.error || "Could not submit comment.");
        return;
      }

      setName("");
      setEmail("");
      setContent("");
      setMessage("Thanks! Your comment was submitted and is awaiting approval.");
    });
  }

  return (
    <section className="mt-12 border-t border-slate-200 pt-8">
      <h2 className="text-2xl font-bold text-slate-900">Comments & Queries</h2>
      <p className="mt-2 text-sm text-slate-600">
        Ask a question or share feedback. Comments are moderated before publishing.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>
        <textarea
          required
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment or query..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}
        {message ? (
          <p className="text-sm text-emerald-700">{message}</p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Post Comment"}
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500">No approved comments yet.</p>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{comment.name}</p>
                <p className="text-xs text-slate-500">
                  {new Intl.DateTimeFormat("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(comment.createdAt))}
                </p>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {comment.content}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
