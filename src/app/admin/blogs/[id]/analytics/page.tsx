import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Globe2, Mail, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function BlogAnalyticsPage({ params }: PageProps) {
  const { id } = await params;

  const blog = await prisma.blog.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      views: true,
      commentsEnabled: true,
    },
  });

  if (!blog) {
    notFound();
  }

  const [byCountry, byCity, recentVisits, comments] = await Promise.all([
    prisma.pageView.groupBy({
      by: ["country"],
      where: { blogId: blog.id },
      _count: { _all: true },
      orderBy: { _count: { country: "desc" } },
      take: 50,
    }),
    prisma.pageView.groupBy({
      by: ["country", "city"],
      where: { blogId: blog.id },
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
      take: 100,
    }),
    prisma.pageView.findMany({
      where: { blogId: blog.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        city: true,
        country: true,
        region: true,
        referrer: true,
        createdAt: true,
        path: true,
      },
    }),
    prisma.blogComment.findMany({
      where: { blogId: blog.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
        content: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const trackedViews = recentVisits.length;
  const uniqueCountries = byCountry.filter((row) => row.country).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/blogs"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blogs
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Blog Visit Details
          </h1>
          <p className="mt-2 max-w-3xl text-slate-600">{blog.title}</p>
          <Link
            href={`/${blog.slug}`}
            target="_blank"
            className="mt-2 inline-block text-sm text-primary hover:underline"
          >
            /{blog.slug}
          </Link>
        </div>
        <Link
          href={`/admin/blogs/${blog.id}/edit`}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Edit blog
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Views</p>
            <Eye className="h-4 w-4 text-violet-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{blog.views}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Tracked Visits</p>
            <MapPin className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{trackedViews}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Countries</p>
            <Globe2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {uniqueCountries}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Visits by Country
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
                {byCountry.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No location data yet.
                    </td>
                  </tr>
                ) : (
                  byCountry.map((row) => (
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
              Visits by City
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">City</th>
                  <th className="px-5 py-3 font-medium">Country</th>
                  <th className="px-5 py-3 font-medium">Visits</th>
                </tr>
              </thead>
              <tbody>
                {byCity.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No city data yet.
                    </td>
                  </tr>
                ) : (
                  byCity.map((row) => (
                    <tr
                      key={`${row.country}-${row.city}`}
                      className="border-t border-slate-100"
                    >
                      <td className="px-5 py-3 text-slate-900">
                        {row.city || "Unknown"}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
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
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Visit Log
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest tracked visits for this blog.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">City</th>
                <th className="px-5 py-3 font-medium">Country</th>
                <th className="px-5 py-3 font-medium">Region</th>
                <th className="px-5 py-3 font-medium">Referrer</th>
                <th className="px-5 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentVisits.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    No tracked visits for this blog yet.
                  </td>
                </tr>
              ) : (
                recentVisits.map((visit) => (
                  <tr key={visit.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 text-slate-900">
                      {visit.city || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {visit.country || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {visit.region || "—"}
                    </td>
                    <td className="max-w-[240px] truncate px-5 py-3 text-slate-600">
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

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-slate-900">
              Contact details from comments
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Emails appear only when visitors voluntarily submit a comment/query.
            Phone numbers and emails cannot be scraped from anonymous page
            visits.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Comment</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {comments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    No comments yet. Enable comments on this blog to collect
                    visitor emails/queries.
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr key={comment.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {comment.name}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      <a
                        href={`mailto:${comment.email}`}
                        className="text-primary hover:underline"
                      >
                        {comment.email}
                      </a>
                    </td>
                    <td className="max-w-sm px-5 py-3 text-slate-600">
                      {comment.content}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {comment.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatDateTime(comment.createdAt)}
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
