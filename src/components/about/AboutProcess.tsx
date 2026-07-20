import { aboutProcess } from "@/data/about";
import AnimatedSection from "@/components/about/AnimatedSection";
import { Container, Section, SectionHeading } from "@/components/ui";

export default function AboutProcess() {
  return (
    <Section className="bg-white py-20 lg:py-28">
      <Container>
        <AnimatedSection>
          <SectionHeading
            caption="Our Process"
            captionClassName="text-primary"
            title="A clear path from idea to launch"
            description="Our proven process keeps projects organized, transparent and focused on delivering real business outcomes."
          />
        </AnimatedSection>

        <div className="relative">
          <div
            aria-hidden
            className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-primary via-primary/40 to-transparent lg:left-1/2 lg:block"
          />

          <div className="space-y-8 lg:space-y-12">
            {aboutProcess.map((step, index) => (
              <AnimatedSection key={step.title} delay={index * 0.08}>
                <div
                  className={`relative grid items-center gap-6 lg:grid-cols-2 lg:gap-16 ${
                    index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
                  }`}
                >
                  <div
                    className={`rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm lg:p-10 ${
                      index % 2 === 1 ? "lg:text-left" : "lg:text-right"
                    }`}
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                      Step {step.step}
                    </p>
                    <h3 className="mt-3 text-2xl font-bold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-5 lg:justify-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white shadow-[0_16px_40px_-18px_rgba(0,95,213,0.55)]">
                      {step.step}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
