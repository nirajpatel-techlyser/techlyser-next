"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SiNextdotjs, SiShopify, SiWordpress } from "react-icons/si";
import { aboutHero } from "@/data/about";
import { Container, Section } from "@/components/ui";

const techBadges = [
  { name: "Shopify", icon: SiShopify },
  { name: "Next.js", icon: SiNextdotjs },
  { name: "WordPress", icon: SiWordpress },
] as const;

export default function AboutHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Section className="relative overflow-hidden bg-white pb-20 pt-16 lg:pb-28 lg:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,95,213,0.1),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.04),transparent_40%)]"
      />

      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              About Techlyser
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
              {aboutHero.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              {aboutHero.description}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href={aboutHero.primaryCta.href}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(0,95,213,0.55)] transition hover:-translate-y-0.5 hover:bg-primary-hover"
              >
                {aboutHero.primaryCta.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href={aboutHero.secondaryCta.href}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >
                {aboutHero.secondaryCta.label}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="absolute -inset-3 rounded-4xl bg-linear-to-br from-primary/15 via-slate-100 to-transparent blur-sm" />

            <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-slate-950 shadow-[0_30px_80px_-30px_rgba(0,95,213,0.35)]">
              <div className="relative aspect-4/3">
                <Image
                  src="/images/tech-hero.png"
                  alt="Shopify, Next.js and WordPress development at Techlyser"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
              </div>

              <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
                <div className="rounded-2xl border border-white/15 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Our Core Stack
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {techBadges.map(({ name, icon: Icon }) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-800"
                      >
                        <Icon className="h-4 w-4 text-primary" aria-hidden />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="absolute -right-2 -top-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:-right-4 sm:-top-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Expertise
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">
                Ecommerce & Web Apps
              </p>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
