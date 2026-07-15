import Link from "next/link";
import Image from "next/image";
import { hero } from "@/data/hero";

import {
  Button,
  Badge,
  Card,
  Container,
  Section,
  SectionHeading,
} from "@/components/ui";

export default function Hero() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Container className="grid items-center gap-16 lg:grid-cols-2">
        {/* LEFT CONTENT */}

        <div>
          <Badge>{hero.badge}</Badge>

          <h1 className="mt-8 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {hero.title.line1}{" "}
            <span className="text-blue-600">{hero.title.highlight}</span>{" "}
            {hero.title.line2}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            {hero.description}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button href="/contact">Start Your Project</Button>
            <Button href="/portfolio" variant="outline">
              View Portfolio
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {hero.features.map((feature) => (
              <div
                key={feature}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="relative">
          <div className="relative flex justify-center">
            <Image
              src="/images/tech-hero.png"
              alt="Techlyser"
              width={900}
              height={700}
              priority
              className="mx-auto w-full max-w-2xl drop-shadow-2xl"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
