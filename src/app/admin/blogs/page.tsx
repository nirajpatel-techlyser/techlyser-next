import Link from "next/link";
import { BlogStatus } from "@prisma/client";
import { PlusCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import BlogTable from "@/components/admin/tables/BlogTable";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  page?: string;
}>;

const PAGE_SIZE = 12;

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const status =
    params.status === "PUBLISHED" || params.status === "DRAFT"
      ? (params.status as BlogStatus)
      : undefined;
  const page = Math.max(1, Number(params.page || "1") || 1);

  const where = {
    AND: [
      q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { slug: { contains: q, mode: "insensitive" as const } },
              { category: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {},
      status ? { status } : {},
    ],
  };

  const [total, posts] = await Promise.all([
    prisma.blog.count({ where }),
    prisma.blog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        status: true,
        views: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Blogs
          </h1>
          <p className="mt-2 text-slate-600">
            Latest added first (draft or published). Search, filter, edit and
            publish posts.
          </p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          <PlusCircle className="h-4 w-4" />
          New Blog
        </Link>
      </div>

      <form className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title, slug, category…"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
        <select
          name="status"
          defaultValue={status || ""}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        >
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Filter
        </button>
      </form>

      <BlogTable
        posts={posts.map((post) => ({
          ...post,
          publishedAt: post.publishedAt?.toISOString() ?? null,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        }))}
      />

      <div className="flex items-center justify-between text-sm text-slate-600">
        <p>
          Page {page} of {totalPages} · {total} posts
        </p>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              href={`/admin/blogs?q=${encodeURIComponent(q)}&status=${status || ""}&page=${page - 1}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-white"
            >
              Previous
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link
              href={`/admin/blogs?q=${encodeURIComponent(q)}&status=${status || ""}&page=${page + 1}`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-white"
            >
              Next
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
