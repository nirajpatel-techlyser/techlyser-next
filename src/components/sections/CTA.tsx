import { cta } from "@/data/cta";

import { Button, Container, Section, Tag } from "@/components/ui";

import { ArrowRight, Phone, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function CTA() {
  return (
    <Section className="bg-slate-950">
      <Container>
        <div className="relative overflow-hidden rounded-[36px] bg-transparent px-8 py-20 text-center shadow-2xl lg:px-24">
          {/* Decorative Circles */}
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />

          <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-white/5" />

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-4xl">
            {/* Caption */}
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-100">
              {cta.badge}
            </p>

            {/* Heading */}
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-white lg:text-6xl">
              {cta.title}{" "}
              <span className="text-blue-200">{cta.titleHighlight}</span>
            </h2>

            {/* Description */}
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-blue-100">
              {cta.description}
            </p>

            {/* Buttons */}
            <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
              <Button variant="primary" href={cta.primaryButton.href}>
                {cta.primaryButton.text}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button href={cta.secondaryButton.href} variant="bg_secondBtn">
                <FaWhatsapp className="mr-2 h-5 w-5" />
                {cta.secondaryButton.text}
              </Button>
            </div>

            {/* Bottom Tags */}
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              {cta.highlights.map((item) => (
                <Tag
                  key={item}
                  className="border-white/20 bg-white/10 text-white"
                >
                  {item}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
