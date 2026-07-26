import Link from "next/link";

import { Container, Section } from "@/components/ui";
import ShopifyExpertsTypewriter from "@/components/sections/ShopifyExpertsTypewriter";
import HeroVisual from "@/components/sections/HeroVisual";
import HeroServicesBadge from "@/components/sections/HeroServicesBadge";

import { Star, BadgeCheck } from "lucide-react";

const avatars = [
  { initials: "AK", color: "bg-primary" },
  { initials: "SR", color: "bg-violet-600" },
  { initials: "JM", color: "bg-emerald-600" },
  { initials: "NP", color: "bg-sky-600" },
];

export default function Hero() {
  return (
    <Section className="relative overflow-x-clip bg-surface-dark !py-3 text-hero-fg sm:!py-8 lg:!py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-[2px] sm:h-96 sm:w-96"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-primary/5 sm:h-80 sm:w-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-80 -translate-y-1/4 rounded-full bg-primary/6 blur-2xl"
      />

      <Container className="defaultClass relative z-10">
        <div className="relative z-10 mx-auto grid max-w-360 items-center gap-3 px-4 py-1 sm:gap-8 sm:px-6 sm:py-6 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-8">
          {/* VISUAL — pulled up on mobile for more CTA room */}
          <div className="relative z-10 order-1 w-full self-start -mt-1 pb-5 sm:mt-0 sm:pb-8 lg:order-2 lg:pb-6">
            <div className="relative">
              <HeroVisual />

              <div className="absolute -bottom-0.5 left-1 right-1 z-40 sm:bottom-3 sm:left-4 sm:right-4">
                <div className="keep-light bg-solid-white flex w-full items-center gap-2 rounded-[5px] border border-black/10 p-2 pr-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.28)] sm:items-start sm:gap-4 sm:p-3.5 sm:pr-6">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-white sm:h-12 sm:w-12 sm:text-sm">
                    LV
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-on-light-muted line-clamp-2 text-[11px] italic leading-snug sm:line-clamp-none sm:text-sm">
                      &ldquo;I was very impressed with TECHLYSER and their
                      expertise in customizing my Shopify store.&rdquo;
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1 sm:mt-1.5 sm:gap-1.5">
                      <span className="text-on-light text-[11px] font-medium sm:text-sm">
                        Luca van Paassen
                      </span>
                      <BadgeCheck
                        className="h-3 w-3 fill-emerald-500 text-white sm:h-4 sm:w-4"
                        aria-hidden
                      />
                      <span className="text-[9px] font-medium uppercase tracking-wide text-emerald-600 sm:text-[11px]">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 order-2 max-w-2xl pt-0 lg:order-1">
            <div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-5 sm:gap-3">
              <div className="flex -space-x-2">
                {avatars.map((avatar) => (
                  <span
                    key={avatar.initials}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface-dark text-[9px] font-medium text-white shadow-sm sm:h-9 sm:w-9 sm:text-[10px] ${avatar.color}`}
                  >
                    {avatar.initials}
                  </span>
                ))}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-2.5 w-2.5 fill-amber-400 text-amber-400 sm:h-3.5 sm:w-3.5"
                        aria-hidden
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-medium text-hero-fg sm:text-sm">
                    4.9 Rating
                  </p>
                </div>
                <p className="mt-0.5 text-[11px] font-medium text-hero-fg sm:text-sm">
                  700+ Successful Projects Delivered
                </p>
              </div>
            </div>

            <HeroServicesBadge />

            <h1 className="mt-2.5 font-heading text-[1.45rem] font-semibold leading-[1.15] tracking-tight text-hero-fg sm:mt-4 sm:text-4xl lg:text-[2.65rem]">
              Building High-Performance{" "}
              <span className="text-primary">Ecommerce Experiences</span> That
              Drive Sales.
            </h1>

            <p className="mt-2 hidden max-w-xl text-sm font-normal leading-6 text-hero-fg-muted sm:mt-4 sm:block sm:text-base sm:leading-7">
              We help ambitious businesses grow with Shopify development, modern
              Next.js apps, WordPress solutions, and conversion-focused UI/UX.
            </p>

            <div className="mt-3 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:gap-3">
              <Link
                href="/contact"
                className="btn-brand rounded-[5px] px-5 py-2.5 text-center text-sm shadow-[0_12px_28px_-12px_rgba(255,0,0,0.55)] transition sm:px-7 sm:py-3.5"
              >
                Start Your Project
              </Link>
              <Link
                href="/portfolio"
                className="bg-solid-white rounded-[5px] px-5 py-2.5 text-center text-sm font-medium text-[#0a0a0a] transition hover:bg-slate-100 sm:px-7 sm:py-3.5"
              >
                View Portfolio
              </Link>
            </div>

            <ShopifyExpertsTypewriter />
          </div>
        </div>
      </Container>
    </Section>
  );
}
