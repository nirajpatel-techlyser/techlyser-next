import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CTA from "@/components/sections/CTA";
import JsonLd from "@/components/seo/JsonLd";
import ShopifyLocationLinks from "@/components/seo/ShopifyLocationLinks";
import { Container, Section } from "@/components/ui";
import {
  getAllShopifyLocationSlugs,
  getShopifyLocationBySlug,
  shopifyIndiaFaqs,
  shopifyIndiaHub,
} from "@/data/shopify-locations";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  faqPageJsonLd,
  professionalServiceJsonLd,
  serviceJsonLd,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ city: string }>;
};

export function generateStaticParams() {
  return getAllShopifyLocationSlugs().map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city } = await params;
  const location = getShopifyLocationBySlug(city);

  if (!location) {
    return { title: "Not found" };
  }

  return buildPageMetadata({
    title: location.metaTitle,
    description: location.metaDescription,
    path: `/shopify-developers/${location.slug}`,
    keywords: location.keywords,
  });
}

export default async function ShopifyDevelopersCityPage({ params }: PageProps) {
  const { city } = await params;
  const location = getShopifyLocationBySlug(city);

  if (!location) {
    notFound();
  }

  const path = `/shopify-developers/${location.slug}`;
  const faqs = [
    ...(location.faqs || []),
    ...shopifyIndiaFaqs.slice(0, 3),
  ];

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Shopify Developers India", path: shopifyIndiaHub.path },
      { name: location.city, path },
    ]),
    professionalServiceJsonLd({
      name: `Shopify Developers — ${location.city}`,
      description: location.metaDescription,
      url: path,
      areaName: location.city,
    }),
    serviceJsonLd({
      name: `Shopify Development in ${location.city}`,
      description: location.metaDescription,
      url: path,
      serviceType: "Shopify development",
    }),
    faqPageJsonLd(faqs),
  ];

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={jsonLd} />
      <Navbar />
      <main>
        <Section className="bg-surface-dark text-hero-fg">
          <Container className="py-14 sm:py-20">
            <nav aria-label="Breadcrumb" className="text-sm text-hero-fg-muted">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link
                href={shopifyIndiaHub.path}
                className="hover:text-primary"
              >
                Shopify India
              </Link>
              <span className="mx-2">/</span>
              <span className="text-hero-fg">{location.city}</span>
            </nav>
            <h1 className="mt-6 max-w-3xl font-heading text-3xl font-semibold leading-tight sm:text-4xl">
              {location.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-hero-fg-muted">
              {location.intro}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/free-shopify-audit"
                className="btn-brand inline-flex items-center justify-center gap-2 rounded-[5px] px-7 py-3.5"
              >
                Book a Free Shopify Audit
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center rounded-[5px] border border-white/20 px-7 py-3.5 font-medium transition hover:bg-white/5"
              >
                View portfolio
              </Link>
            </div>
          </Container>
        </Section>

        <Section className="py-16">
          <Container className="max-w-3xl">
            <h2 className="font-heading text-2xl font-semibold text-slate-900">
              What you get with Techlyser in {location.region}
            </h2>
            <ul className="mt-6 space-y-4">
              {location.highlights.map((item) => (
                <li key={item} className="flex gap-3 text-slate-700">
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10 space-y-4 text-slate-600 leading-8">
              <p>
                Looking for{" "}
                <strong>Shopify developers in {location.city}</strong> who
                understand conversion, Core Web Vitals, and maintainable theme
                architecture? Techlyser is a{" "}
                <Link
                  href={shopifyIndiaHub.path}
                  className="font-medium text-primary underline"
                >
                  Shopify development agency in India
                </Link>{" "}
                trusted by growing ecommerce brands. Whether you are in{" "}
                {location.city} or hiring remotely, you get the same senior
                Shopify developers, QA, and launch support.
              </p>
              <p>
                We also help with Shopify Plus, headless commerce on Next.js,
                WordPress/WooCommerce migrations, and ongoing optimization —
                so {location.city} brands can scale without rebuilding every
                year.
              </p>
            </div>
          </Container>
        </Section>

        <Section className="section-bg-grey py-16">
          <Container className="max-w-3xl">
            <h2 className="font-heading text-2xl font-semibold text-slate-900">
              FAQs — Shopify in {location.city}
            </h2>
            <dl className="mt-8 space-y-6">
              {faqs.map((item) => (
                <div key={item.question}>
                  <dt className="font-semibold text-slate-900">
                    {item.question}
                  </dt>
                  <dd className="mt-2 text-slate-600 leading-7">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </Section>

        <ShopifyLocationLinks variant="compact" />
        <CTA />
      </main>
    </div>
  );
}
