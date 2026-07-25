import { ReactNode } from "react";
import { auth } from "@/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AuthProvider from "@/components/admin/AuthProvider";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-slate-50">
        <div className="sticky top-0 hidden h-screen md:block">
          <AdminSidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Content Management
                </p>
                <p className="text-sm text-slate-700">
                  Signed in as{" "}
                  <span className="font-semibold text-slate-900">
                    {session.user.email}
                  </span>
                </p>
              </div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                View site
              </a>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
