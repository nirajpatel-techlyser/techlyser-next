import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist_Mono, Nunito, Roboto } from "next/font/google";
import AnalyticsTracker from "@/components/shared/AnalyticsTracker";
import { getSiteSettings } from "@/lib/settings";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Techlyser Web Solutions",
    template: "%s | Techlyser Web Solutions",
  },
  description:
    "Techlyser Web Solutions builds high-performance Shopify stores, Next.js apps, and custom web solutions that help businesses grow online.",
  metadataBase: new URL("https://techlyser.com"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const isAdminRoute = pathname.startsWith("/admin");

  const settings = await getSiteSettings();
  // Admin UI must stay light even when the public site theme is dark.
  const theme = isAdminRoute
    ? "light"
    : settings.theme === "LIGHT"
      ? "light"
      : "dark";

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${nunito.variable} ${roboto.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className={`min-h-full flex flex-col font-sans ${
          isAdminRoute
            ? "bg-slate-50 text-slate-900"
            : "bg-background text-foreground"
        }`}
      >
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
