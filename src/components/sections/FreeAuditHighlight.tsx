import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Store } from "lucide-react";
import { Container, Section } from "@/components/ui";

const bullets = [
  "No hidden charges",
  "No commitment",
  "Real developers, not automated reports",
];

const proof = [
  "700+ projects delivered",
  "4.9 average client rating",
  "Trusted by multi-brand teams",
];

const brands = ["Innosupps", "Liv Body", "Mate Tea", "Motherly", "TruBrain"];

export default function FreeAuditHighlight() {
  return (
    <Section className="bg-surface-dark pt-0 sm:pt-0 lg:pt-0">
      <Container>
        <div className="group relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 p-6 shadow-[0_18px_60px_-30px_rgba(255,84,0,0.5)] transition hover:scale-[1.01] sm:p-8 lg:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition duration-1000 group-hover:translate-x-[120%]"
          />

          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Free Shopify Growth Audit
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-heading sm:text-3xl">
              Found a bug? Slow store? Poor mobile experience?
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-hero-fg-muted sm:text-base">
              We will audit your Shopify store and fix up to two high-impact
              issues for free. Premium execution, zero obligation.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {brands.map((brand) => (
                <span
                  key={brand}
                  className="bg-solid-white rounded-full border border-primary/20 px-3 py-1 text-xs font-medium text-on-light"
                >
                  {brand}
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {bullets.map((item) => (
                <div
                  key={item}
                  className="bg-solid-white flex items-center gap-2 rounded-xl border border-primary/20 px-3 py-2.5 text-sm text-on-light shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {proof.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs font-medium text-hero-fg"
                >
                  {index === 0 ? (
                    <Store className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-7">
              <Link
                href="/free-shopify-audit"
                className="btn-brand inline-flex items-center gap-2 rounded-[5px] px-6 py-3 text-sm font-semibold"
              >
                Claim Your Free Store Fix
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
