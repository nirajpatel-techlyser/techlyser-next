import Link from "next/link";
import { BlogStatus, CommentStatus } from "@prisma/client";
import {
  Eye,
  FileText,
  FilePenLine,
  Globe2,
  MessageSquare,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

function formatDateTime(value: Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[admin/dashboard] ${label} failed:`, error);
    return fallback;
  }
}

export default async function AdminDashboardPage() {
  // Keep concurrency low — Supabase session pooler rejects too many parallel clients.
  const total = await safe("total", () => prisma.blog.count(), 0);
  const published = await safe(
    "published",
    () => prisma.blog.count({ where: { status: BlogStatus.PUBLISHED } }),
    0,
  );
  const drafts = await safe(
    "drafts",
    () => prisma.blog.count({ where: { status: BlogStatus.DRAFT } }),
    0,
  );
  const viewsAgg = await safe(
    "viewsAgg",
    () => prisma.blog.aggregate({ _sum: { views: true } }),
    { _sum: { views: 0 } },
  );
  const visitCount = await safe("visitCount", () => prisma.pageView.count(), 0);
  const pendingComments = await safe(
    "pendingComments",
    () =>
      prisma.blogComment.count({ where: { status: CommentStatus.PENDING } }),
    0,
  );

  const recent = await safe(
    "recent",
    () =>
      prisma.blog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          views: true,
          updatedAt: true,
          createdAt: true,
          publishedAt: true,
        },
      }),
    [],
  );

  const recentVisits = await safe(
    "recentVisits",
    () =>
      prisma.pageView.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        include: {
          blog: {
            select: { title: true, slug: true },
          },
        },
      }),
    [],
  );

  const topCountries = await safe(
    "topCountries",
    () =>
      prisma.pageView.groupBy({
        by: ["country"],
        _count: { _all: true },
        orderBy: { _count: { country: "desc" } },
        take: 8,
      }),
    [],
  );

  const blogViews = await safe(
    "blogViews",
    () =>
      prisma.blog.findMany({
        where: { status: BlogStatus.PUBLISHED },
        orderBy: { views: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
        },
      }),
    [],
  );

  // One grouped query instead of N+1 per blog.
  const blogIds = blogViews.map((blog) => blog.id);
  const geoRows = blogIds.length
    ? await safe(
        "blogGeo",
        () =>
          prisma.pageView.groupBy({
            by: ["blogId", "country", "city"],
            where: { blogId: { in: blogIds } },
            _count: { _all: true },
            orderBy: { _count: { blogId: "desc" } },
            take: 40,
          }),
        [],
      )
    : [];

  const blogGeo = blogViews.map((blog) => {
    const geos = geoRows
      .filter((row) => row.blogId === blog.id)
      .slice(0, 3);
    return { ...blog, geos };
  });

  const stats = [
    {
      label: "Total Blogs",
      value: total,
      icon: FileText,
      tone: "bg-blue-50 text-primary",
      href: "/admin/blogs",
    },
    {
      label: "Published",
      value: published,
      icon: Sparkles,
      tone: "bg-emerald-50 text-emerald-700",
      href: "/admin/blogs?status=PUBLISHED",
    },
    {
      label: "Site Visits",
      value: visitCount,
      icon: Globe2,
      tone: "bg-sky-50 text-sky-700",
      href: "/admin/analytics",
    },
    {
      label: "Blog Views",
      value: viewsAgg._sum.views ?? 0,
      icon: Eye,
      tone: "bg-violet-50 text-violet-700",
      href: "/admin/analytics",
    },
    {
      label: "Drafts",
      value: drafts,
      icon: FilePenLine,
      tone: "bg-amber-50 text-amber-700",
      href: "/admin/blogs?status=DRAFT",
    },
    {
      label: "Pending Comments",
      value: pendingComments,
      icon: MessageSquare,
      tone: "bg-rose-50 text-rose-700",
      href: "/admin/comments",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-600">
            Content, visits, geo analytics and comment moderation overview.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/comments"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            <MessageSquare className="h-4 w-4" />
            Comments
          </Link>
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            <PlusCircle className="h-4 w-4" />
            New Blog
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tone, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <span className={`rounded-xl p-2 ${tone}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
            <p className="mt-2 text-xs font-medium text-primary">View details →</p>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Website Visits
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Path, city and country for latest visitors.
            </p>
          </div>
          <Link
            href="/admin/analytics"
            className="text-sm font-medium text-primary hover:underline"
          >
            Full analytics
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Page</th>
                <th className="px-5 py-3 font-medium">City</th>
                <th className="px-5 py-3 font-medium">Country</th>
                <th className="px-5 py-3 font-medium">Referrer</th>
                <th className="px-5 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentVisits.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No visits tracked yet. Browse the public site to generate
                    analytics.
                  </td>
                </tr>
              ) : (
                recentVisits.map((visit) => (
                  <tr key={visit.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {visit.blog?.title || visit.path}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {visit.city || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {visit.country || "—"}
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-3 text-slate-600">
                      {visit.referrer || "Direct"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatDateTime(visit.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Top Countries
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Country</th>
                  <th className="px-5 py-3 font-medium">Visits</th>
                </tr>
              </thead>
              <tbody>
                {topCountries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No geo data yet.
                    </td>
                  </tr>
                ) : (
                  topCountries.map((row) => (
                    <tr
                      key={row.country || "unknown"}
                      className="border-t border-slate-100"
                    >
                      <td className="px-5 py-3 text-slate-900">
                        {row.country || "Unknown"}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {row._count._all}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Blog Views by Location
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Blog</th>
                  <th className="px-5 py-3 font-medium">Views</th>
                  <th className="px-5 py-3 font-medium">Top Locations</th>
                </tr>
              </thead>
              <tbody>
                {blogGeo.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No blog view analytics yet.
                    </td>
                  </tr>
                ) : (
                  blogGeo.map((blog) => (
                    <tr key={blog.id} className="border-t border-slate-100">
                      <td className="px-5 py-3 font-medium text-slate-900">
                        <Link
                          href={`/${blog.slug}`}
                          className="hover:text-primary"
                          target="_blank"
                        >
                          {blog.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{blog.views}</td>
                      <td className="px-5 py-3 text-slate-600">
                        {blog.geos.length === 0
                          ? "—"
                          : blog.geos
                              .map(
                                (geo) =>
                                  `${geo.city || "—"}, ${geo.country || "Unknown"} (${geo._count._all})`,
                              )
                              .join(" · ")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Posts</h2>
          <Link
            href="/admin/blogs"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Views</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No blogs yet. Create your first post.
                  </td>
                </tr>
              ) : (
                recent.map((post) => (
                  <tr key={post.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {post.title}
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
                    <td className="px-5 py-3 text-slate-600">{post.views}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatDateTime(post.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3">
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
