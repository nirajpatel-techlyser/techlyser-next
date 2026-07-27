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
  shopifyIndiaHub,
} from "@/data/shopify-locations";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  professionalServiceJsonLd,
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
  ];

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={jsonLd} />
      <Navbar />
      <main>
        <Section className="bg-surface-dark text-hero-fg">
          <Container className="py-14 sm:py-20">
            <nav className="text-sm text-hero-fg-muted">
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
                href="/contact"
                className="btn-brand inline-flex items-center justify-center gap-2 rounded-[5px] px-7 py-3.5"
              >
                Start your Shopify project
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
            <p className="mt-8 text-slate-600 leading-8">
              We are a{" "}
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
          </Container>
        </Section>

        <ShopifyLocationLinks variant="compact" />
        <CTA />
      </main>
    </div>
  );
}
