import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Star, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ContactForm from "@/components/contact/ContactForm";
import CTA from "@/components/sections/CTA";
import { Container, Section } from "@/components/ui";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Free Shopify Growth Audit",
  description:
    "Claim a free Shopify growth audit from Techlyser. We identify high-impact issues in performance, UX, conversion, accessibility, and SEO, and fix the first two where feasible.",
  path: "/free-shopify-audit",
  keywords: [
    "free Shopify audit",
    "Shopify growth audit",
    "Shopify speed check",
    "Shopify UX audit",
    "Shopify SEO health check",
  ],
});

const points = [
  "Performance",
  "Mobile UX",
  "Conversion",
  "Accessibility",
  "SEO",
];

const trustBadges = [
  "700+ successful projects",
  "4.9 average rating",
  "Multi-brand ecommerce experience",
];

const brands = ["Innosupps", "Liv Body", "Mate Tea", "Motherly", "Actizio"];

export default function FreeShopifyAuditPage() {
  return (
    <div className="min-h-screen bg-surface-dark">
      <Navbar />
      <main>
        <Section className="bg-surface-dark text-hero-fg">
          <Container>
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Free Shopify Growth Audit
                </p>
                <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                  We review your Shopify store and fix the two highest-impact
                  issues.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-hero-fg-muted">
                  We inspect what is hurting speed, user experience, and
                  conversions. If fixes are small enough, we implement the first
                  two at no cost.
                </p>

                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {points.map((point) => (
                    <div key={point} className="flex items-center gap-2 text-sm text-hero-fg">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="#audit-form"
                    className="btn-brand inline-flex items-center gap-2 rounded-[5px] px-6 py-3 text-sm font-semibold"
                  >
                    Get My Free Audit
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/portfolio"
                    className="rounded-[5px] border border-white/20 px-6 py-3 text-sm font-semibold text-hero-fg transition hover:bg-white/5"
                  >
                    View Our Work
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-hero-fg">
                  What you get (free)
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-hero-fg-muted">
                  <li>Full audit summary with priority issues</li>
                  <li>Action plan focused on revenue impact</li>
                  <li>Up to two practical fixes implemented by our team</li>
                  <li>No lock-in and no surprise charges</li>
                </ul>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Trusted delivery
                  </p>
                  <div className="mt-3 space-y-2">
                    {trustBadges.map((item, index) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-hero-fg">
                        {index === 1 ? (
                          <Star className="h-4 w-4 text-primary" />
                        ) : index === 2 ? (
                          <Users className="h-4 w-4 text-primary" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        )}
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {brands.map((brand) => (
                      <span
                        key={brand}
                        className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-hero-fg-muted"
                      >
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <div id="audit-form" className="bg-background pt-6">
          <ContactForm />
        </div>

        <CTA />
      </main>
    </div>
  );
}
