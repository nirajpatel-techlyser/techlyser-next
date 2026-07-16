"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

import FaqCard from "@/components/cards/FaqCard";
import { Button, Container, SectionHeading, Section } from "@/components/ui";
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
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
          {/* Left Side */}
          <div className="max-w-3xl">
            <SectionHeading
              caption="FAQ"
              title={
                <>
                  {faqSectionMeta.title}{" "}
                  <span className="text-blue-600">
                    {faqSectionMeta.titleHighlight}
                  </span>
                </>
              }
              description={faqSectionMeta.description}
              align="left"
            />
          </div>

          {/* Right Side */}
          <Button href="/portfolio" variant="outline">
            Views All Projects
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Button>
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
