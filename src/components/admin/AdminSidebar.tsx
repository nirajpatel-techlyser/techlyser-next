"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PlusCircle,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/blogs/new", label: "New Blog", icon: PlusCircle },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Techlyser
        </p>
        <h1 className="mt-1 text-lg font-bold text-slate-900">Admin Panel</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
