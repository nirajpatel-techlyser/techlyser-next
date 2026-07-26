import BenefitCard from "@/components/cards/BenefitCard";

import { Container, Section, SectionHeading } from "@/components/ui";

import { benefits } from "@/data/benefits";

export default function WhyChoose() {
  return (
    <Section id="why-choose" className="section-bg-grey">
      <Container>
        <SectionHeading
          caption="WHY CHOOSE TECHLYSER"
          title="More Than Just a Development Agency"
          description="We build digital products that are fast, scalable, easy to maintain, and focused on helping your business grow."
        />

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 md:gap-8">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.id} benefit={benefit} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
