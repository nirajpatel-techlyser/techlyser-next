"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { aboutStats } from "@/data/about";
import AnimatedSection from "@/components/about/AnimatedSection";
import { Container, Section } from "@/components/ui";

function AnimatedCounter({
  value,
  suffix,
}: {
  value: number;
  suffix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    if (prefersReducedMotion) {
      setCount(value);
      return;
    }

    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [isInView, prefersReducedMotion, value]);

  return (
    <span ref={ref} aria-label={`${value}${suffix}`}>
      {count}
      {suffix}
    </span>
  );
}

export default function AboutStats() {
  return (
    <Section className="bg-white py-20 lg:py-28">
      <Container>
        <AnimatedSection>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {aboutStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_24px_60px_-28px_rgba(0,95,213,0.2)]"
              >
                <p className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-3 text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </Container>
    </Section>
  );
}
