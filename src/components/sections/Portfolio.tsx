import Image from "next/image";
import { portfolio } from "@/data/portfolio";
import PortfolioCard from "@/components/cards/PortfolioCard";

import { Container, Section, SectionHeading, Button } from "@/components/ui";

export default function Portfolio() {
  return (
    <Section id="portolio">
      <Container className="portfolioClass">
        {/* Section Header */}

        <div className="mb-20 flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
          {/* Left Side */}
          <div className="max-w-3xl">
            <SectionHeading
              caption="OUR PORTFOLIO"
              title="Featured Projects"
              description="We build high-performance Shopify stores, modern web applications, and beautiful digital experiences that help businesses grow online."
              align="left"
            />
          </div>

          {/* Right Side */}
          <Button href="/portfolio" variant="outline">
            View All Projects
          </Button>
        </div>

        {/* Cards */}
        <div className="grid gap-16 lg:grid-cols-2">
          {portfolio.map((project, index) => (
            <PortfolioCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
