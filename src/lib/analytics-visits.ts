export type DailyVisitPoint = {
  date: string; // YYYY-MM-DD
  label: string;
  views: number;
};

function toDateKey(date: Date, timeZone = "Asia/Kolkata") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function labelForKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 6));
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function startOfDayInZone(daysAgo: number, timeZone = "Asia/Kolkata") {
  const now = new Date();
  const key = toDateKey(
    new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
    timeZone,
  );
  // Approximate UTC instant for IST midnight of that calendar day
  return new Date(`${key}T00:00:00+05:30`);
}

export function buildDailyVisitSeries(
  timestamps: Date[],
  days = 30,
  timeZone = "Asia/Kolkata",
): DailyVisitPoint[] {
  const counts = new Map<string, number>();
  for (const ts of timestamps) {
    const key = toDateKey(ts, timeZone);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const series: DailyVisitPoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = toDateKey(
      new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      timeZone,
    );
    series.push({
      date: key,
      label: labelForKey(key),
      views: counts.get(key) || 0,
    });
  }
  return series;
}

export function getTodayYesterdayKeys(timeZone = "Asia/Kolkata") {
  return {
    today: toDateKey(new Date(), timeZone),
    yesterday: toDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000), timeZone),
  };
}

export { startOfDayInZone, toDateKey };
