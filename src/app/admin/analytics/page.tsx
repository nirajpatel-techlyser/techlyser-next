import Link from "next/link";
import { ArrowLeft, CalendarDays, Eye, Globe2, Search } from "lucide-react";
import VisitsTrendChart from "@/components/admin/analytics/VisitsTrendChart";
import {
  buildDailyVisitSeries,
  getTodayYesterdayKeys,
  startOfDayInZone,
} from "@/lib/analytics-visits";
import { prisma } from "@/lib/prisma";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function hostFromReferrer(referrer: string | null) {
  if (!referrer) return "Direct / Unknown";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 60);
  }
}

function searchQueryFromReferrer(referrer: string | null) {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    const host = url.hostname.replace(/^www\./, "");
    const params = url.searchParams;
    const query =
      params.get("q") ||
      params.get("query") ||
      params.get("p") ||
      params.get("text") ||
      params.get("wd");

    if (!query?.trim()) return null;

    const engine = host.includes("google.")
      ? "Google"
      : host.includes("bing.")
        ? "Bing"
        : host.includes("yahoo.")
          ? "Yahoo"
          : host.includes("duckduckgo.")
            ? "DuckDuckGo"
            : host;

    return { engine, query: query.trim().slice(0, 120) };
  } catch {
    return null;
  }
}

async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[admin/analytics] ${label} failed:`, error);
    return fallback;
  }
}

export default async function SiteAnalyticsPage() {
  const { today: todayKey, yesterday: yesterdayKey } = getTodayYesterdayKeys();
  const rangeStart = startOfDayInZone(29);
  const todayStart = startOfDayInZone(0);
  const yesterdayStart = startOfDayInZone(1);

  // Sequential + safe queries to avoid Supabase session pool exhaustion.
  const visitCount = await safe("visitCount", () => prisma.pageView.count(), 0);
  const todayViews = await safe(
    "todayViews",
    () => prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
    0,
  );
  const yesterdayViews = await safe(
    "yesterdayViews",
    () =>
      prisma.pageView.count({
        where: {
          createdAt: { gte: yesterdayStart, lt: todayStart },
        },
      }),
    0,
  );
  const recentTimestamps = await safe(
    "recentTimestamps",
    () =>
      prisma.pageView.findMany({
        where: { createdAt: { gte: rangeStart } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    [],
  );
  const byCountry = await safe(
    "byCountry",
    () =>
      prisma.pageView.groupBy({
        by: ["country"],
        _count: { _all: true },
        orderBy: { _count: { country: "desc" } },
        take: 30,
      }),
    [],
  );
  const byCity = await safe(
    "byCity",
    () =>
      prisma.pageView.groupBy({
        by: ["country", "city"],
        _count: { _all: true },
        orderBy: { _count: { city: "desc" } },
        take: 40,
      }),
    [],
  );
  const byPath = await safe(
    "byPath",
    () =>
      prisma.pageView.groupBy({
        by: ["path"],
        _count: { _all: true },
        orderBy: { _count: { path: "desc" } },
        take: 20,
      }),
    [],
  );
  const byReferrer = await safe(
    "byReferrer",
    () =>
      prisma.pageView.groupBy({
        by: ["referrer"],
        _count: { _all: true },
        orderBy: { _count: { referrer: "desc" } },
        take: 30,
      }),
    [],
  );
  const recentVisits = await safe(
    "recentVisits",
    () =>
      prisma.pageView.findMany({
        orderBy: { createdAt: "desc" },
        take: 40,
        include: {
          blog: { select: { title: true, slug: true } },
        },
      }),
    [],
  );

  const referrerHosts = new Map<string, number>();
  for (const row of byReferrer) {
    const host = hostFromReferrer(row.referrer);
    referrerHosts.set(host, (referrerHosts.get(host) || 0) + row._count._all);
  }
  const topSources = [...referrerHosts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const searchQueries = new Map<
    string,
    { engine: string; query: string; count: number }
  >();
  for (const row of byReferrer) {
    const found = searchQueryFromReferrer(row.referrer);
    if (!found) continue;
    const key = `${found.engine}::${found.query.toLowerCase()}`;
    const existing = searchQueries.get(key);
    if (existing) {
      existing.count += row._count._all;
    } else {
      searchQueries.set(key, {
        engine: found.engine,
        query: found.query,
        count: row._count._all,
      });
    }
  }
  const topSearches = [...searchQueries.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  const dailySeries = buildDailyVisitSeries(
    recentTimestamps.map((row) => row.createdAt),
    30,
  );

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Website Visit Analytics
        </h1>
        <p className="mt-2 text-slate-600">
          See where visitors come from and which pages they open — use this to
          plan SEO and content improvements.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Today</p>
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{todayViews}</p>
          <p className="mt-1 text-xs text-slate-500">IST calendar day</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Yesterday</p>
            <CalendarDays className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {yesterdayViews}
          </p>
          <p className="mt-1 text-xs text-slate-500">Previous IST day</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Visits</p>
            <Eye className="h-4 w-4 text-violet-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{visitCount}</p>
          <p className="mt-1 text-xs text-slate-500">All time</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Countries</p>
            <Globe2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {byCountry.filter((row) => row.country).length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Cities: {byCity.filter((row) => row.city).length}
          </p>
        </div>
      </div>

      <VisitsTrendChart
        data={dailySeries}
        todayKey={todayKey}
        yesterdayKey={yesterdayKey}
      />

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
                      No visits yet.
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

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Top Pages</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Path</th>
                  <th className="px-5 py-3 font-medium">Visits</th>
                </tr>
              </thead>
              <tbody>
                {byPath.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No page data yet.
                    </td>
                  </tr>
                ) : (
                  byPath.map((row) => (
                    <tr key={row.path} className="border-t border-slate-100">
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {row.path}
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
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-slate-900">
                Traffic Sources
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Where visitors came from (Google, Direct, social, etc.).
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Visits</th>
                </tr>
              </thead>
              <tbody>
                {topSources.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No source data yet.
                    </td>
                  </tr>
                ) : (
                  topSources.map(([source, count]) => (
                    <tr key={source} className="border-t border-slate-100">
                      <td className="px-5 py-3 text-slate-900">{source}</td>
                      <td className="px-5 py-3 text-slate-600">{count}</td>
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
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-slate-900">
              Search Queries
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Keywords visitors used on Google/Bing when the referrer still
            includes the query (many engines hide this now).
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Query</th>
                <th className="px-5 py-3 font-medium">Engine</th>
                <th className="px-5 py-3 font-medium">Visits</th>
              </tr>
            </thead>
            <tbody>
              {topSearches.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    No search query strings captured yet. Traffic Sources above
                    still shows Google / Direct / social volume.
                  </td>
                </tr>
              ) : (
                topSearches.map((row) => (
                  <tr
                    key={`${row.engine}-${row.query}`}
                    className="border-t border-slate-100"
                  >
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {row.query}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{row.engine}</td>
                    <td className="px-5 py-3 text-slate-600">{row.count}</td>
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
            Recent Website Visits
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Page</th>
                <th className="px-5 py-3 font-medium">City</th>
                <th className="px-5 py-3 font-medium">Country</th>
                <th className="px-5 py-3 font-medium">Source</th>
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
                    No visits tracked yet.
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
                      {hostFromReferrer(visit.referrer)}
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
    </div>
  );
}
