import { Handshake, Palette, Rocket, Zap } from "lucide-react";
import { aboutWhyChoose } from "@/data/about";
import AnimatedSection from "@/components/about/AnimatedSection";
import { Container, Section, SectionHeading } from "@/components/ui";

const iconMap = {
  rocket: Rocket,
  zap: Zap,
  palette: Palette,
  handshake: Handshake,
} as const;

export default function AboutWhyChoose() {
  return (
    <Section className="bg-white py-20 lg:py-28">
      <Container>
        <AnimatedSection>
          <SectionHeading
            caption="Why Choose Us"
            captionClassName="text-primary"
            title="Built for growth, designed for impact"
            description="We combine Shopify expertise, performance engineering and thoughtful design to help your business stand out online."
          />
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {aboutWhyChoose.map((item, index) => {
            const Icon = iconMap[item.icon];

            return (
              <AnimatedSection key={item.title} delay={index * 0.08}>
                <article className="group h-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_24px_60px_-28px_rgba(0,95,213,0.25)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-7 w-7" aria-hidden />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-4 leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              </AnimatedSection>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
