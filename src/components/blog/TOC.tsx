import Link from "next/link";
import type { TocItem } from "@/lib/blog-html";

type TOCProps = {
  items: TocItem[];
};

export default function TOC({ items }: TOCProps) {
  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
        On this page
      </p>
      <ol className="mt-3 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className={item.level === 3 ? "ml-4 text-sm" : "text-sm"}
          >
            <Link
              href={`#${item.id}`}
              className="text-slate-700 transition hover:text-primary"
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
