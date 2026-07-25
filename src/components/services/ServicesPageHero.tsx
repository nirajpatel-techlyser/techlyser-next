import Link from "next/link";

import { Badge, Container, Section } from "@/components/ui";

export default function ServicesPageHero() {
  return (
    <Section className="relative overflow-hidden bg-surface-dark text-hero-fg">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      />

      <Container className="relative z-10 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="border border-white/10 bg-white/8 text-primary">
            Our Services
          </Badge>
          <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight text-hero-fg sm:text-5xl lg:text-[3.25rem]">
            Digital solutions that{" "}
            <span className="text-primary">grow your business</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-hero-fg-muted">
            From Shopify storefronts and Next.js apps to WordPress, UI/UX,
            performance, and SEO — explore how Techlyser helps ambitious brands
            launch faster and convert better.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="btn-brand rounded-[5px] px-7 py-3.5 shadow-[0_12px_28px_-12px_rgba(255,0,0,0.55)]"
            >
              Start a Project
            </Link>
            <Link
              href="/portfolio"
              className="bg-solid-white rounded-[5px] px-7 py-3.5 font-medium text-[#0a0a0a] transition hover:bg-slate-100"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
