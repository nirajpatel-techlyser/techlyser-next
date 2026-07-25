import type { Metadata } from "next";
import { Suspense } from "react";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="admin-shell flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
          Techlyser Web Solutions CMS
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Admin Login
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Sign in to manage blogs and website content.
        </p>

        <Suspense fallback={<div className="mt-8 h-48 animate-pulse rounded-xl bg-slate-100" />}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
