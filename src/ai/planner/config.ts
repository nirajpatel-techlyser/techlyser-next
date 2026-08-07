import { slugifyAiKey } from "../utils";

export const PLANNER_HUBS = [
  {
    id: "hub-resources",
    title: "Free Resources",
    path: "/resources",
  },
  {
    id: "hub-shopify-india",
    title: "Shopify Developers India",
    path: "/shopify-developers-india",
  },
  {
    id: "hub-shopify-service",
    title: "Shopify Development",
    path: "/services/shopify",
  },
  {
    id: "hub-free-audit",
    title: "Free Shopify Growth Audit",
    path: "/free-shopify-audit",
  },
] as const;

export function suggestArticlePath(title: string) {
  return `/${slugifyAiKey(title)}`;
}

export function suggestClusterSlug(name: string) {
  return slugifyAiKey(name).slice(0, 80) || "cluster";
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function distributeDates(count: number, start: Date, spanDays: number) {
  if (count <= 0) return [] as Date[];
  if (count === 1) return [new Date(start)];
  const dates: Date[] = [];
  for (let i = 0; i < count; i += 1) {
    const offset = Math.round((i * (spanDays - 1)) / (count - 1));
    dates.push(addDays(start, offset));
  }
  return dates;
}
