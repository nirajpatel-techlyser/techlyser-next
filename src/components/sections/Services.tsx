import { services } from "@/data/services";
import ServiceCard from "@/components/cards/ServiceCard";
import Container from "../ui/Container";
import Section from "../ui/Section";
import Button from "../ui/Button";
export default function Services() {
  return (
    <Section id="services">
      <Container className="defaultClass">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Our Services
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Solutions That Help Your Business Grow
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            We build high-performance Shopify stores, modern web applications,
            and beautiful digital experiences that help businesses grow online.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
