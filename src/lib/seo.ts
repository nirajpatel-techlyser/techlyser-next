import type { Metadata } from "next";

export const siteConfig = {
  name: "Techlyser Web Solutions",
  legalName: "Techlyser Web Solutions",
  shortName: "Techlyser",
  url: "https://techlyser.com",
  locale: "en_IN",
  language: "en-IN",
  email: "info@techlyser.com",
  phone: "+919753808608",
  phoneDisplay: "+91 97538 08608",
  country: "India",
  foundingYear: 2018,
  address: {
    streetAddress: "A-86, Sanskruti Royal City",
    addressLocality: "Rau",
    addressRegion: "Madhya Pradesh",
    postalCode: "453331",
    addressCountry: "IN",
  },
  geo: {
    // Approximate coordinates for Rau, Indore (business location)
    latitude: 22.6369,
    longitude: 75.8097,
  },
  defaultTitle:
    "Shopify Web Design & Development Agency in Indore | Techlyser",
  defaultDescription:
    "Techlyser Web Solutions is an Indore-based Shopify web design and development agency helping DTC and e-commerce brands build fast, responsive and conversion-focused online stores.",
  defaultOgImage: "/images/tech-hero.png",
} as const;

type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  /** Optional; omitted from metadata when empty (meta keywords are obsolete for Google). */
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

/** True when the title already carries Techlyser branding (avoid template double-suffix). */
export function titleIncludesBrand(title: string): boolean {
  return /\btechlyser\b/i.test(title.trim());
}

/**
 * Use absolute title when brand is already present; otherwise let the root
 * template append `| Techlyser Web Solutions`.
 */
export function resolveMetadataTitle(title: string): Metadata["title"] {
  const normalized = title.trim();
  if (titleIncludesBrand(normalized)) {
    return { absolute: normalized };
  }
  return normalized;
}

export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalized}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  ogImage = siteConfig.defaultOgImage,
  noIndex = false,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
}: PageSeoInput): Metadata {
  const canonical = path.startsWith("http") ? path : path || "/";
  const canonicalPath = canonical.startsWith("http")
    ? new URL(canonical).pathname
    : canonical;
  const imageUrl = absoluteUrl(ogImage);
  const resolvedTitle = resolveMetadataTitle(title);
  const ogTitle = title.trim();

  return {
    title: resolvedTitle,
    description,
    ...(keywords && keywords.length > 0 ? { keywords } : {}),
    authors: authors?.map((name) => ({ name })),
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "Technology",
    alternates: {
      canonical: canonicalPath,
      languages: {
        "en-IN": canonicalPath,
        en: canonicalPath,
        "x-default": canonicalPath,
      },
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        }
      : {
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
      type,
      locale: siteConfig.locale,
      url: absoluteUrl(canonicalPath),
      siteName: siteConfig.name,
      title: ogTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(authors ? { authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [imageUrl],
    },
  };
}

export function organizationJsonLd(sameAs: string[] = []) {
  const socials = sameAs.filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.legalName,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    foundingDate: String(siteConfig.foundingYear),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/images/TEXHLYSER_white_Logo.png"),
      width: 512,
      height: 512,
    },
    image: absoluteUrl(siteConfig.defaultOgImage),
    sameAs: socials,
    address: {
      "@type": "PostalAddress",
      ...siteConfig.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: siteConfig.phone,
        contactType: "sales",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    ],
    // Service area (not additional offices). Business location remains Rau, Indore.
    areaServed: [
      { "@type": "Country", name: "India" },
      { "@type": "City", name: "Indore" },
    ],
    knowsAbout: [
      "Shopify development",
      "Shopify Plus",
      "Headless commerce",
      "Next.js",
      "WordPress",
      "WooCommerce",
      "Ecommerce SEO",
      "AI automation",
      "Web performance",
      "Core Web Vitals",
    ],
    slogan:
      "Build Shopify stores that perform, convert, and scale.",
  };
}

export function localBusinessJsonLd(sameAs: string[] = []) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#localbusiness`,
    name: siteConfig.legalName,
    url: siteConfig.url,
    image: absoluteUrl(siteConfig.defaultOgImage),
    telephone: siteConfig.phone,
    email: siteConfig.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      ...siteConfig.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "10:00",
      closes: "19:00",
    },
    sameAs: sameAs.filter(Boolean),
    areaServed: "India",
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: siteConfig.language,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function webPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
  type?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": input.type || "WebPage",
    "@id": absoluteUrl(input.path),
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description,
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    about: { "@id": `${siteConfig.url}/#organization` },
    inLanguage: siteConfig.language,
  };
}

export function professionalServiceJsonLd(input: {
  name: string;
  description: string;
  url: string;
  areaName: string;
  serviceType?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.url),
    provider: { "@id": `${siteConfig.url}/#organization` },
    areaServed: {
      "@type": "Place",
      name: input.areaName,
    },
    serviceType: input.serviceType || "Shopify development",
    telephone: siteConfig.phone,
    email: siteConfig.email,
  };
}

export function serviceJsonLd(input: {
  name: string;
  description: string;
  url: string;
  serviceType: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.url),
    provider: { "@id": `${siteConfig.url}/#organization` },
    serviceType: input.serviceType,
    areaServed: {
      "@type": "Country",
      name: "India",
    },
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

export function blogPostingJsonLd(input: {
  title: string;
  description: string;
  slug: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  keywords?: string[];
  wordCount?: number;
  readingTimeMinutes?: number;
}) {
  const url = absoluteUrl(`/${input.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: input.title,
    description: input.description,
    image: input.image ? absoluteUrl(input.image) : absoluteUrl(siteConfig.defaultOgImage),
    datePublished: input.datePublished,
    dateModified: input.dateModified || input.datePublished,
    author: {
      "@type": "Person",
      name: input.author,
      url: absoluteUrl("/about"),
    },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: input.keywords,
    wordCount: input.wordCount,
    timeRequired: input.readingTimeMinutes
      ? `PT${input.readingTimeMinutes}M`
      : undefined,
    inLanguage: siteConfig.language,
    isAccessibleForFree: true,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "article header p", ".blog-content p"],
    },
  };
}

export function collectionPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    about: { "@id": `${siteConfig.url}/#organization` },
  };
}

/** Service catalog for /services — ItemList of Service entities (no fake ratings). */
export function serviceCatalogJsonLd(
  items: Array<{ name: string; description: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl("/services"),
    url: absoluteUrl("/services"),
    name: "Web & Shopify Services",
    description:
      "Shopify development, Next.js, WordPress, UI/UX, performance, and SEO services from Techlyser Web Solutions in Indore.",
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    about: { "@id": `${siteConfig.url}/#organization` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: item.name,
          description: item.description,
          url: absoluteUrl(item.url),
          provider: { "@id": `${siteConfig.url}/#organization` },
        },
      })),
    },
  };
}

export function siteNavigationJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

export function howToJsonLd(input: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    step: input.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function personJsonLd(input: {
  name: string;
  jobTitle?: string;
  image?: string;
  url?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    jobTitle: input.jobTitle,
    image: input.image ? absoluteUrl(input.image) : undefined,
    url: input.url ? absoluteUrl(input.url) : absoluteUrl("/about"),
    worksFor: { "@id": `${siteConfig.url}/#organization` },
  };
}
