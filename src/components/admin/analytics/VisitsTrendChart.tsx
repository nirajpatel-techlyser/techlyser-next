import type { DailyVisitPoint } from "@/lib/analytics-visits";

type Props = {
  data: DailyVisitPoint[];
  todayKey: string;
  yesterdayKey: string;
};

const CHART_HEIGHT_PX = 180;

export default function VisitsTrendChart({
  data,
  todayKey,
  yesterdayKey,
}: Props) {
  const max = Math.max(1, ...data.map((d) => d.views));
  const totalInRange = data.reduce((sum, d) => sum + d.views, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Visits by date
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Last {data.length} days (IST) · {totalInRange} visits in this range
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Today
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Yesterday
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" /> Other days
          </span>
        </div>
      </div>

      {totalInRange === 0 ? (
        <p className="mt-10 text-center text-sm text-slate-500">
          No visits in this period yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto pb-2">
          <div
            className="flex min-w-[720px] items-end gap-1.5 border-b border-slate-100 pt-8"
            style={{ height: CHART_HEIGHT_PX + 32 }}
            role="img"
            aria-label="Daily website visits chart"
          >
            {data.map((point) => {
              const heightPx =
                point.views > 0
                  ? Math.max(8, Math.round((point.views / max) * CHART_HEIGHT_PX))
                  : 0;
              const isToday = point.date === todayKey;
              const isYesterday = point.date === yesterdayKey;
              const barColor = isToday
                ? "bg-primary"
                : isYesterday
                  ? "bg-amber-400"
                  : "bg-slate-300 hover:bg-slate-400";

              return (
                <div
                  key={point.date}
                  className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                >
                  {point.views > 0 ? (
                    <span className="mb-1 text-[10px] font-semibold text-slate-600 opacity-0 transition group-hover:opacity-100">
                      {point.views}
                    </span>
                  ) : null}
                  <div
                    className={`w-full max-w-[26px] rounded-t-md transition ${barColor}`}
                    style={{ height: `${heightPx}px` }}
                    title={`${point.label}: ${point.views} visits`}
                  />
                  <span className="mt-2 max-w-full truncate text-center text-[10px] leading-none text-slate-500">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
