import type { Metadata } from "next";

export const siteConfig = {
  name: "Techlyser Web Solutions",
  legalName: "Techlyser Web Solutions",
  url: "https://techlyser.com",
  locale: "en_IN",
  email: "info@techlyser.com",
  phone: "+918819886862",
  country: "India",
  defaultTitle: "Shopify Developers India | Best Shopify Agency",
  defaultDescription:
    "Hire expert Shopify developers in India. Techlyser is a best-in-class Shopify agency for custom stores, migrations, Shopify Plus, speed, and SEO — serving Indore, Mumbai, Ahmedabad, Bangalore, Gujarat, and clients worldwide.",
  keywords: [
    "Shopify developers India",
    "best Shopify agency",
    "Shopify developers Indore",
    "Shopify developers Mumbai",
    "Shopify developers Ahmedabad",
    "Shopify developers Bangalore",
    "Shopify developers Gujarat",
    "Shopify development company India",
    "Shopify Plus developers",
    "Shopify agency India",
    "custom Shopify theme development",
    "Shopify store development",
    "ecommerce developers India",
  ],
} as const;

type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
};

export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalized}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [...siteConfig.keywords],
  ogImage = "/images/hero-image.png",
  noIndex = false,
}: PageSeoInput): Metadata {
  const canonical = path.startsWith("http") ? path : path || "/";
  const canonicalPath = canonical.startsWith("http")
    ? new URL(canonical).pathname
    : canonical;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalPath,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: absoluteUrl(canonicalPath),
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: absoluteUrl(ogImage),
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(ogImage)],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.legalName,
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    logo: absoluteUrl("/images/TEXHLYSER_white_Logo.png"),
    sameAs: [] as string[],
    areaServed: [
      { "@type": "Country", name: "India" },
      { "@type": "City", name: "Indore" },
      { "@type": "City", name: "Mumbai" },
      { "@type": "City", name: "Ahmedabad" },
      { "@type": "City", name: "Bangalore" },
      { "@type": "AdministrativeArea", name: "Gujarat" },
    ],
    knowsAbout: [
      "Shopify development",
      "Shopify Plus",
      "Ecommerce SEO",
      "Next.js",
      "Web performance",
    ],
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "en-IN",
    publisher: {
      "@type": "Organization",
      name: siteConfig.legalName,
      url: siteConfig.url,
    },
  };
}

export function professionalServiceJsonLd(input: {
  name: string;
  description: string;
  url: string;
  areaName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.url),
    provider: {
      "@type": "Organization",
      name: siteConfig.legalName,
      url: siteConfig.url,
      telephone: siteConfig.phone,
      email: siteConfig.email,
    },
    areaServed: {
      "@type": "Place",
      name: input.areaName,
    },
    serviceType: "Shopify development",
  };
}

export function faqPageJsonLd(
  items: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
