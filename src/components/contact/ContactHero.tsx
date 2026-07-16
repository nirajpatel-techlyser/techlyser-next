"use client";

import { useState } from "react";
import { contactHero } from "@/data/contact";

import { Badge, Container, Section, SectionHeading } from "@/components/ui";

export default function ContactHero() {
  return (
    <Section className="bg-slate-50">
      <Container className="text-center">
        <Badge>{contactHero.caption}</Badge>

        <SectionHeading
          caption=""
          title={
            <>
              {contactHero.title}{" "}
              <span className="text-blue-600">
                {contactHero.titleHighlight}
              </span>
            </>
          }
          description={contactHero.description}
        />

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {contactHero.stats.map((item) => (
            <span
              key={item}
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </Container>
    </Section>
  );
}
