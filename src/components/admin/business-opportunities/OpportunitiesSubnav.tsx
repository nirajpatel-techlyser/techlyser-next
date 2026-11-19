"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/business-opportunities/discover", label: "Discover" },
  { href: "/admin/business-opportunities/leads", label: "Business Leads" },
  { href: "/admin/business-opportunities/concepts", label: "Website Concepts" },
  { href: "/admin/business-opportunities/proposals", label: "PDF Proposals" },
  { href: "/admin/business-opportunities/outreach", label: "Email Campaigns" },
  { href: "/admin/business-opportunities/history", label: "Search History" },
  { href: "/admin/business-opportunities/settings", label: "Settings" },
];

export default function OpportunitiesSubnav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
