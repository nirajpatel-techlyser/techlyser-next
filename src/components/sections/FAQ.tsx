"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

import FaqCard from "@/components/cards/FaqCard";
import { Button, Container, Section } from "@/components/ui";
import { faqItems, faqSectionMeta, type FaqItem } from "@/data/faq";

interface FAQProps {
  items?: FaqItem[];
  category?: string;
}

export default function FAQ({ items, category }: FAQProps) {
  const [openId, setOpenId] = useState<number | null>(null);

  const data =
    items ??
    (category
      ? faqItems.filter((item) => item.category === category)
      : faqItems);

  const toggleItem = (id: number) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <Section id="faq" className="section-bg-grey">
      <Container>
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-start">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
              {faqSectionMeta.caption}
            </p>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
              {faqSectionMeta.title}{" "}
              <span className="text-blue-600">
                {faqSectionMeta.titleHighlight}
              </span>
            </h2>
          </div>

          <div className="max-w-md lg:pt-2">
            <p className="text-lg leading-8 text-slate-600">
              {faqSectionMeta.description}
            </p>

            <Button
              href={faqSectionMeta.ctaHref}
              variant="outline"
              className="mt-8"
            >
              {faqSectionMeta.ctaText}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>

        <div className="mt-14 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-16">
          {data.map((item) => (
            <FaqCard
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
