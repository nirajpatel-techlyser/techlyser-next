import BenefitCard from "@/components/cards/BenefitCard";

import { Container, Section, SectionHeading } from "@/components/ui";

import { benefits } from "@/data/benefits";

export default function WhyChoose() {
  return (
    <Section id="why-choose">
      <Container>
        <SectionHeading
          caption="WHY CHOOSE TECHLYSER"
          title="More Than Just a Development Agency"
          description="We build digital products that are fast, scalable, easy to maintain, and focused on helping your business grow."
        />

        <div className="grid gap-8 md:grid-cols-2">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.id} benefit={benefit} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
