import { ReactNode } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminChrome from "@/components/admin/AdminChrome";
import AuthProvider from "@/components/admin/AuthProvider";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const isLoginPage = pathname.startsWith("/admin/login");

  // Logged-in users should never stay on the login screen.
  if (session?.user && isLoginPage) {
    redirect("/admin");
  }

  // Login page stays chrome-free (no sidebar), even while AuthProvider wraps it.
  if (!session?.user || isLoginPage) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <AuthProvider>
      <AdminChrome email={session.user.email}>
        {children}
      </AdminChrome>
    </AuthProvider>
  );
}
