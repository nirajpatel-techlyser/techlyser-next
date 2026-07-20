import { aboutStory } from "@/data/about";
import AnimatedSection from "@/components/about/AnimatedSection";
import { Container, Section } from "@/components/ui";

export default function AboutStory() {
  return (
    <Section className="section-bg-grey py-20 lg:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <AnimatedSection>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              Who We Are
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {aboutStory.title}
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] lg:p-10">
              {aboutStory.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-base leading-8 text-slate-600 lg:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </Container>
    </Section>
  );
}
