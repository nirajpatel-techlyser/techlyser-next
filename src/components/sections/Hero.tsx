import Link from "next/link";
import Image from "next/image";

import { Badge, Container, Section } from "@/components/ui";

import { Star, BadgeCheck } from "lucide-react";

const avatars = [
  { initials: "AK", color: "bg-primary" },
  { initials: "SR", color: "bg-violet-600" },
  { initials: "JM", color: "bg-emerald-600" },
  { initials: "NP", color: "bg-sky-600" },
];

export default function Hero() {
  return (

    <Section className="relative overflow-x-clip bg-surface-dark text-hero-fg">
      <Container className="defaultClass">
        <div className="relative z-10 mx-auto grid max-w-[90rem] items-start gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-10">
          {/* LEFT */}
          <div className="relative z-10 max-w-2xl pt-1">
            {/* Avatars + rating / social proof */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className="flex -space-x-2.5">
                {avatars.map((avatar) => (
                  <span
                    key={avatar.initials}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface-dark text-[10px] font-medium text-white shadow-sm ${avatar.color}`}
                  >
                    {avatar.initials}
                  </span>
                ))}
              </div>


              <div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                        aria-hidden
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-hero-fg">4.9 Rating</p>
                </div>
                <p className="mt-0.5 text-sm font-medium text-hero-fg">
                  700+ Successful Projects Delivered
                </p>
              </div>
            </div>

            <Badge>Shopify • Next.js • WordPress Agency</Badge>

            <h1 className="mt-4 font-heading text-3xl font-semibold leading-[1.15] tracking-tight text-hero-fg sm:text-4xl lg:text-[2.65rem]">
              Building High-Performance{" "}
              <span className="text-primary">Ecommerce Experiences</span> That
              Drive Sales.
            </h1>

            <p className="mt-4 max-w-xl text-base font-normal leading-7 text-hero-fg-muted">
              We help ambitious businesses grow with Shopify development, modern
              Next.js apps, WordPress solutions, and conversion-focused UI/UX.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="btn-brand rounded-[5px] px-7 py-3.5 text-center shadow-[0_12px_28px_-12px_rgba(255,0,0,0.55)] transition"
              >
                Start Your Project
              </Link>
              <Link
                href="/portfolio"
                className="bg-solid-white rounded-[5px] px-7 py-3.5 text-center font-medium text-[#0a0a0a] transition hover:bg-slate-100"
              >
                View Portfolio
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <span className="rounded-[5px] border-2 border-hero-pill-border bg-hero-pill-bg px-4 py-2 text-sm font-medium text-hero-fg shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
                ✔ Shopify Expert
              </span>
              <span className="rounded-[5px] border-2 border-hero-pill-border bg-hero-pill-bg px-4 py-2 text-sm font-medium text-hero-fg shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
                ✔ Performance First
              </span>
              <span className="rounded-[5px] border-2 border-hero-pill-border bg-hero-pill-bg px-4 py-2 text-sm font-medium text-hero-fg shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
                ✔ SEO Optimized
              </span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative z-10 w-full self-start pb-10 sm:pb-12">
            <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-surface-black shadow-[0_28px_70px_-24px_rgba(255,0,0,0.35)] ring-1 ring-hero-border sm:aspect-[4/3]">
              <Image
                src="/images/tech-hero.png"
                alt="Techlyser ecommerce and modern web development"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-[center_42%]"
              />
            </div>

            {/* Floating review — full width over image bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-3 sm:px-4">
              <div className="keep-light bg-solid-white flex w-full items-start gap-3 rounded-[5px] border-2 border-hero-review-border p-3 pr-5 shadow-[0_12px_40px_rgba(0,0,0,0.32)] sm:gap-4 sm:p-3.5 sm:pr-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white sm:h-12 sm:w-12">
                  LV
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-on-light-muted text-[13px] italic leading-snug sm:text-sm">
                    &ldquo;I was very impressed with TECHLYSER and their
                    expertise in customizing my Shopify store.&rdquo;
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-on-light text-sm font-medium">
                      Luca van Paassen
                    </span>
                    <BadgeCheck
                      className="h-4 w-4 fill-emerald-500 text-white"
                      aria-hidden
                    />
                    <span className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">
                      Verified Review
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
