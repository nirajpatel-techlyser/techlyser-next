import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist_Mono, Nunito, Roboto } from "next/font/google";
import AnalyticsTracker from "@/components/shared/AnalyticsTracker";
import JsonLd from "@/components/seo/JsonLd";
import { getSiteSettings } from "@/lib/settings";
import { organizationJsonLd, siteConfig, webSiteJsonLd } from "@/lib/seo";
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
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.defaultDescription,
  keywords: [...siteConfig.keywords],
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [{ url: "/images/hero-image.png", alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: ["/images/hero-image.png"],
  },
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
        {!isAdminRoute ? (
          <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
        ) : null}
        {children}
      </body>
    </html>
  );
}
