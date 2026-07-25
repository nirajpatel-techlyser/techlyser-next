"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CommentStatus } from "@prisma/client";
import { deleteComment, updateCommentStatus } from "@/actions/comments";

export type AdminCommentRow = {
  id: string;
  name: string;
  email: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  blogTitle: string;
  blogSlug: string;
};

export default function CommentsTable({
  comments,
}: {
  comments: AdminCommentRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-5 py-3 font-medium">Blog</th>
            <th className="px-5 py-3 font-medium">From</th>
            <th className="px-5 py-3 font-medium">Comment</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                No comments yet.
              </td>
            </tr>
          ) : (
            comments.map((comment) => (
              <tr key={comment.id} className="border-t border-slate-100 align-top">
                <td className="px-5 py-3">
                  <a
                    href={`/${comment.blogSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {comment.blogTitle}
                  </a>
                </td>
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900">{comment.name}</p>
                  <p className="text-xs text-slate-500">{comment.email}</p>
                </td>
                <td className="max-w-sm px-5 py-3 text-slate-700">
                  {comment.content}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      comment.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700"
                        : comment.status === "PENDING"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {comment.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {new Intl.DateTimeFormat("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(comment.createdAt))}
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-col gap-2">
                    {comment.status !== "APPROVED" ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            await updateCommentStatus(
                              comment.id,
                              CommentStatus.APPROVED,
                            );
                            router.refresh();
                          })
                        }
                        className="text-left font-medium text-emerald-700 hover:underline disabled:opacity-50"
                      >
                        Approve
                      </button>
                    ) : null}
                    {comment.status !== "REJECTED" ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            await updateCommentStatus(
                              comment.id,
                              CommentStatus.REJECTED,
                            );
                            router.refresh();
                          })
                        }
                        className="text-left font-medium text-slate-600 hover:underline disabled:opacity-50"
                      >
                        Reject
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (!confirm("Delete this comment?")) return;
                        startTransition(async () => {
                          await deleteComment(comment.id);
                          router.refresh();
                        });
                      }}
                      className="text-left font-medium text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
