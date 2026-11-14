import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import WebsiteGrowthAuditWizard from "@/components/website-audit/WebsiteGrowthAuditWizard";
import CTA from "@/components/sections/CTA";
import { Container, Section } from "@/components/ui";
import { buildPageMetadata, webPageJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = buildPageMetadata({
  title: "Free Website Growth Audit",
  description:
    "Analyze your website’s design, SEO, UX, performance and conversion opportunities. Get a Techlyser-branded growth audit report by email.",
  path: "/website-growth-audit",
});

const points = [
  "Website design analysis",
  "SEO and visibility insights",
  "Conversion optimization opportunities",
  "Mobile experience review",
  "Actionable improvement report",
];

export default function WebsiteGrowthAuditPage() {
  return (
    <div className="min-h-screen bg-surface-dark">
      <JsonLd
        data={webPageJsonLd({
          name: "Free Website Growth Audit",
          description:
            "Discover what's holding your website back with Techlyser's Website Growth Audit covering design, SEO, UX, performance and conversion opportunities.",
          path: "/website-growth-audit",
        })}
      />
      <Navbar />
      <main>
        <Section className="bg-surface-dark text-hero-fg">
          <Container>
            <div className="mx-auto max-w-6xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Free Website Growth Audit
              </p>
              <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                Is Your Website Helping Your Business Grow?
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-hero-fg-muted">
                Discover what&apos;s holding your website back. Analyze your website&apos;s
                design, SEO, user experience, performance and conversion opportunities with
                actionable recommendations from Techlyser.
              </p>

              <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {points.map((point) => (
                  <div key={point} className="flex items-center gap-2 text-sm text-hero-fg">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Suspense
                  fallback={
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-hero-fg-muted">
                      Loading audit form…
                    </div>
                  }
                >
                  <WebsiteGrowthAuditWizard />
                </Suspense>
              </div>

              <p className="mt-8 text-sm text-hero-fg-muted">
                Prefer a Shopify-focused review?{" "}
                <Link href="/free-shopify-audit" className="text-primary underline">
                  Free Shopify Growth Audit
                </Link>
              </p>
            </div>
          </Container>
        </Section>
        <CTA />
      </main>
    </div>
  );
}
