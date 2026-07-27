import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CTA from "@/components/sections/CTA";
import JsonLd from "@/components/seo/JsonLd";
import ShopifyLocationLinks from "@/components/seo/ShopifyLocationLinks";
import { Container, Section } from "@/components/ui";
import {
  shopifyIndiaFaqs,
  shopifyIndiaHub,
  shopifyLocations,
} from "@/data/shopify-locations";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  faqPageJsonLd,
  professionalServiceJsonLd,
  siteConfig,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: shopifyIndiaHub.metaTitle,
  description: shopifyIndiaHub.metaDescription,
  path: shopifyIndiaHub.path,
  keywords: [
    "Shopify developers India",
    "best Shopify agency India",
    "Shopify development company India",
    "Shopify Plus developers India",
    "hire Shopify developers India",
  ],
});

const deliverables = [
  "Custom Shopify & Shopify Plus storefronts",
  "Theme rebuilds for speed and conversion",
  "Platform migrations with SEO-safe redirects",
  "App integrations, subscriptions, and B2B",
  "Technical SEO, schema, and Core Web Vitals",
  "Post-launch optimization and retainers",
];

export default function ShopifyDevelopersIndiaPage() {
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Shopify Developers India", path: shopifyIndiaHub.path },
    ]),
    professionalServiceJsonLd({
      name: "Shopify Development — India",
      description: shopifyIndiaHub.metaDescription,
      url: shopifyIndiaHub.path,
      areaName: "India",
    }),
    faqPageJsonLd(shopifyIndiaFaqs),
  ];

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={jsonLd} />
      <Navbar />
      <main>
        <Section className="bg-surface-dark text-hero-fg">
          <Container className="py-14 sm:py-20">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">
              Shopify • India
            </p>
            <h1 className="mt-4 max-w-4xl font-heading text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              {shopifyIndiaHub.headline}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-hero-fg-muted">
              {shopifyIndiaHub.intro}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="btn-brand inline-flex items-center justify-center gap-2 rounded-[5px] px-7 py-3.5"
              >
                Book a free consultation
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/services/shopify"
                className="inline-flex items-center justify-center rounded-[5px] border border-white/20 px-7 py-3.5 font-medium transition hover:bg-white/5"
              >
                Shopify services
              </Link>
            </div>
          </Container>
        </Section>

        <Section className="py-16">
          <Container>
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-slate-900 sm:text-3xl">
                  Why brands choose Techlyser as their Shopify agency
                </h2>
                <p className="mt-4 text-slate-600 leading-8">
                  Ranking on Google takes more than keywords — you need fast
                  pages, clear service positioning, and proof of delivery. We
                  build Shopify projects with conversion UX, maintainable code,
                  and SEO foundations so your store can compete nationally and
                  globally.
                </p>
                <ul className="mt-6 space-y-3">
                  {deliverables.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-slate-700"
                    >
                      <Check
                        className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-slate-900">
                  Cities we actively support
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Remote delivery with localized context for search and sales
                  teams in:
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {shopifyLocations.map((loc) => (
                    <li key={loc.slug}>
                      <Link
                        href={`/shopify-developers/${loc.slug}`}
                        className="inline-block rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:text-primary hover:ring-primary/30"
                      >
                        {loc.city}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-slate-600">
                  Email{" "}
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="font-medium text-primary underline"
                  >
                    {siteConfig.email}
                  </a>{" "}
                  or call{" "}
                  <a
                    href={`tel:${siteConfig.phone}`}
                    className="font-medium text-primary underline"
                  >
                    {siteConfig.phone}
                  </a>
                  .
                </p>
              </div>
            </div>
          </Container>
        </Section>

        <ShopifyLocationLinks variant="full" />

        <Section className="border-t border-slate-200 bg-slate-50 py-16">
          <Container className="max-w-3xl">
            <h2 className="font-heading text-2xl font-semibold text-slate-900">
              Shopify development FAQ (India)
            </h2>
            <dl className="mt-8 space-y-6">
              {shopifyIndiaFaqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-semibold text-slate-900">
                    {faq.question}
                  </dt>
                  <dd className="mt-2 text-slate-600 leading-7">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </Section>

        <CTA />
      </main>
    </div>
  );
}
