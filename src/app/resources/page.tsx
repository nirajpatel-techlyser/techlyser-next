import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CTA from "@/components/sections/CTA";
import JsonLd from "@/components/seo/JsonLd";
import { Container, Section } from "@/components/ui";
import {
  leadMagnets,
  resourceClusters,
  resourceFaqs,
  resourceHero,
} from "@/data/resources";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  collectionPageJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Free Shopify Resources & Guides India",
  description:
    "Free Shopify, Shopify Plus, Next.js, and ecommerce resources from Techlyser — hiring checklists, platform comparisons, headless guides, and a Free Shopify Growth Audit.",
  path: "/resources",
  keywords: [
    "Shopify resources India",
    "Shopify guides",
    "hire Shopify developers checklist",
    "Shopify vs WooCommerce India",
    "Free Shopify audit",
    "headless Shopify India",
  ],
});

export default function ResourcesPage() {
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Resources", path: "/resources" },
    ]),
    webPageJsonLd({
      name: resourceHero.title,
      description: resourceHero.description,
      path: "/resources",
    }),
    collectionPageJsonLd({
      name: "Free Shopify & Ecommerce Resources",
      description: resourceHero.description,
      path: "/resources",
    }),
    faqPageJsonLd(resourceFaqs),
  ];

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={jsonLd} />
      <Navbar />
      <main>
        <Section className="bg-surface-dark text-hero-fg">
          <Container className="py-14 sm:py-20">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              Free resources
            </p>
            <h1 className="mt-4 max-w-3xl font-heading text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              {resourceHero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-hero-fg-muted">
              {resourceHero.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/free-shopify-audit"
                className="btn-brand inline-flex items-center justify-center gap-2 rounded-[5px] px-7 py-3.5"
              >
                Claim Free Shopify Audit
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-[5px] border border-white/20 px-7 py-3.5 font-medium transition hover:bg-white/5"
              >
                Browse all articles
              </Link>
            </div>
          </Container>
        </Section>

        <Section className="py-14">
          <Container>
            <h2 className="font-heading text-2xl font-semibold text-slate-900">
              Start here
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {leadMagnets.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-primary/40 hover:shadow-sm"
                >
                  {item.badge ? (
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      {item.badge}
                    </span>
                  ) : null}
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Open
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="section-bg-grey py-14">
          <Container>
            <h2 className="font-heading text-2xl font-semibold text-slate-900">
              Topic clusters
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Each cluster links a commercial pillar page with supporting guides
              — the same structure search engines and AI answer engines use to
              understand topical authority.
            </p>
            <div className="mt-10 space-y-10">
              {resourceClusters.map((cluster) => (
                <div
                  key={cluster.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {cluster.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                        {cluster.description}
                      </p>
                    </div>
                    <Link
                      href={cluster.pillarHref}
                      className="shrink-0 text-sm font-semibold text-primary hover:underline"
                    >
                      Pillar page →
                    </Link>
                  </div>
                  <ul className="mt-6 grid gap-4 md:grid-cols-2">
                    {cluster.articles.map((article) => (
                      <li key={article.href}>
                        <Link
                          href={article.href}
                          className="flex h-full gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-primary/40"
                        >
                          <BookOpen
                            className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                            aria-hidden
                          />
                          <div>
                            <p className="font-semibold text-slate-900">
                              {article.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {article.description}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="py-14">
          <Container className="max-w-3xl">
            <h2 className="font-heading text-2xl font-semibold text-slate-900">
              FAQs
            </h2>
            <dl className="mt-8 space-y-6">
              {resourceFaqs.map((item) => (
                <div key={item.question}>
                  <dt className="flex gap-2 font-semibold text-slate-900">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                      aria-hidden
                    />
                    {item.question}
                  </dt>
                  <dd className="mt-2 pl-7 text-slate-600 leading-7">
                    {item.answer}
                  </dd>
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
