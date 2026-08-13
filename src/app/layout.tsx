import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist_Mono, Nunito, Roboto } from "next/font/google";
import AnalyticsTracker from "@/components/shared/AnalyticsTracker";
import FloatingContactButtons from "@/components/layout/FloatingContactButtons";
import SiteFooter from "@/components/layout/SiteFooter";
import JsonLd from "@/components/seo/JsonLd";
import { getSiteSettings } from "@/lib/settings";
import { contactInfo } from "@/data/contact";
import { navigation } from "@/data/navigation";
import {
  localBusinessJsonLd,
  organizationJsonLd,
  siteConfig,
  siteNavigationJsonLd,
  webSiteJsonLd,
} from "@/lib/seo";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  adjustFontFallback: true,
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.defaultDescription,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  applicationName: siteConfig.shortName,
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
      en: "/",
      "x-default": "/",
    },
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [
      {
        url: siteConfig.defaultOgImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [siteConfig.defaultOgImage],
  },
  icons: {
    icon: "/images/50x50_favicon_Icon.png",
    apple: "/images/50x50_favicon_Icon.png",
  },
  category: "technology",
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? {
          other: {
            "msvalidate.01": process.env.BING_SITE_VERIFICATION,
          },
        }
      : {}),
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
  const theme = isAdminRoute
    ? "light"
    : settings.theme === "LIGHT"
      ? "light"
      : "dark";

  const sameAs = [
    settings.linkedinUrl,
    settings.instagramUrl,
    settings.facebookUrl,
    settings.googleUrl,
  ].filter(Boolean);

  return (
    <html
      lang={siteConfig.language}
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
          <JsonLd
            data={[
              organizationJsonLd(sameAs),
              localBusinessJsonLd(sameAs),
              webSiteJsonLd(),
              siteNavigationJsonLd(
                navigation.map((item) => ({
                  name: item.label,
                  path: item.href,
                })),
              ),
            ]}
          />
        ) : null}
        <div className="flex min-h-full flex-1 flex-col">{children}</div>
        {!isAdminRoute ? <SiteFooter /> : null}
        {!isAdminRoute ? (
          <FloatingContactButtons
            email={siteConfig.email || contactInfo.email}
            whatsappUrl={settings.whatsappUrl || contactInfo.whatsapp}
          />
        ) : null}
      </body>
    </html>
  );
}
