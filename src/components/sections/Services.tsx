import { services } from "@/data/services";
import ServiceCard from "@/components/cards/ServiceCard";

import { Container, Section, SectionHeading } from "@/components/ui";

export default function Services() {
  return (
    <Section id="services" className="section-bg-grey">
      <Container className="defaultClass">
        <SectionHeading
          caption="OUR SERVICES"
          title="Solutions That Help Your Business Grow"
          description="We build high-performance Shopify stores, modern web applications,
            and beautiful digital experiences that help businesses grow online."
        />

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8 xl:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
