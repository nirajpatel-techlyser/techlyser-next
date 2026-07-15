import Image from "next/image";
import { portfolio } from "@/data/portfolio";
import PortfolioCard from "@/components/cards/PortfolioCard";

import { Container, Section, SectionHeading, Button } from "@/components/ui";

export default function Portfolio() {
  const leftProjects = portfolio.filter((_, index) => index % 2 === 0);
  const rightProjects = portfolio.filter((_, index) => index % 2 !== 0);
  return (
    <Section id="portolio" className="section-bg-grey portfolioClass">
      <Container className="portfolioClass">
        {/* Section Header */}

        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
          {/* Left Side */}
          <div className="max-w-3xl">
            <SectionHeading
              caption="PORTFOLIO"
              title="Featured work"
              description="We help businesses grow with high-performance Shopify stores, modern Next.js applications, WordPress websites, and conversion-focused digital experiences. Explore some of the projects we've delivered for brands across ecommerce and technology."
              align="left"
            />
          </div>

          {/* Right Side */}
          <Button href="/portfolio" variant="outline">
            Views All Projects
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-20">
            {leftProjects.map((project, index) => (
              <PortfolioCard key={project.id} project={project} index={index} />
            ))}
          </div>

          <div className="space-y-20 lg:pt-32">
            {rightProjects.map((project, index) => (
              <PortfolioCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
