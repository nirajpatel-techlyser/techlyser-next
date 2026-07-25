"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { BlogStatus } from "@prisma/client";
import { deleteBlog, duplicateBlog } from "@/actions/blogs";

export type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: BlogStatus;
  views: number;
  publishedAt: string | null;
  updatedAt: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function BlogTable({ posts }: { posts: BlogListItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-5 py-3 font-medium">Title</th>
            <th className="px-5 py-3 font-medium">Category</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Views</th>
            <th className="px-5 py-3 font-medium">Published</th>
            <th className="px-5 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                No blogs found.
              </td>
            </tr>
          ) : (
            posts.map((post) => (
              <tr key={post.id} className="border-t border-slate-100">
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900">{post.title}</p>
                  <p className="text-xs text-slate-500">/{post.slug}</p>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {post.category || "—"}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      post.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/blogs/${post.id}/analytics`}
                    className="inline-flex items-center rounded-lg bg-violet-50 px-2.5 py-1 font-semibold text-violet-700 transition hover:bg-violet-100 hover:underline"
                    title="View city/country visit details"
                  >
                    {post.views}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {formatDate(post.publishedAt)}
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/admin/blogs/${post.id}/analytics`}
                      className="font-medium text-violet-700 hover:underline"
                    >
                      Analytics
                    </Link>
                    <Link
                      href={`/admin/blogs/${post.id}/edit`}
                      className="font-medium text-primary hover:underline"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/${post.slug}`}
                      target="_blank"
                      className="font-medium text-slate-600 hover:underline"
                    >
                      Preview
                    </Link>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await duplicateBlog(post.id);
                        })
                      }
                      className="font-medium text-slate-600 hover:underline disabled:opacity-50"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (!confirm("Delete this blog?")) return;
                        startTransition(async () => {
                          await deleteBlog(post.id);
                          router.refresh();
                        });
                      }}
                      className="font-medium text-red-600 hover:underline disabled:opacity-50"
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
