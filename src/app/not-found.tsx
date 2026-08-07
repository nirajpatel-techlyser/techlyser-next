import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Container } from "@/components/ui";
import { siteConfig } from "@/lib/seo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-dark text-hero-fg">
      <Navbar />
      <main>
        <Container className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            404
          </p>
          <h1 className="mt-4 max-w-2xl font-heading text-3xl font-semibold sm:text-4xl">
            This page could not be found
          </h1>
          <p className="mt-4 max-w-xl text-hero-fg-muted leading-7">
            The URL may be outdated, mistyped, or moved. Explore our Shopify
            services, portfolio, or blog — or book a free Shopify growth audit.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="btn-brand inline-flex items-center justify-center rounded-[5px] px-7 py-3.5"
            >
              Go to homepage
            </Link>
            <Link
              href="/shopify-developers-india"
              className="inline-flex items-center justify-center rounded-[5px] border border-white/20 px-7 py-3.5 font-medium transition hover:bg-white/5"
            >
              Shopify developers India
            </Link>
            <Link
              href="/free-shopify-audit"
              className="inline-flex items-center justify-center rounded-[5px] border border-white/20 px-7 py-3.5 font-medium transition hover:bg-white/5"
            >
              Free Shopify audit
            </Link>
          </div>
          <nav
            aria-label="Popular pages"
            className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-hero-fg-muted"
          >
            <Link href="/services" className="hover:text-primary">
              Services
            </Link>
            <Link href="/portfolio" className="hover:text-primary">
              Portfolio
            </Link>
            <Link href="/blog" className="hover:text-primary">
              Blog
            </Link>
            <Link href="/contact" className="hover:text-primary">
              Contact {siteConfig.shortName}
            </Link>
          </nav>
        </Container>
      </main>
    </div>
  );
}
