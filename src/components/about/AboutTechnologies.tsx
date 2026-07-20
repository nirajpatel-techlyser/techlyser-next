import {
  SiFigma,
  SiGit,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPhp,
  SiReact,
  SiShopify,
  SiTailwindcss,
  SiTypescript,
  SiWordpress,
} from "react-icons/si";
import { aboutTechnologies } from "@/data/about";
import AnimatedSection from "@/components/about/AnimatedSection";
import { Container, Section, SectionHeading } from "@/components/ui";

const iconMap = {
  shopify: SiShopify,
  nextjs: SiNextdotjs,
  react: SiReact,
  tailwind: SiTailwindcss,
  typescript: SiTypescript,
  nodejs: SiNodedotjs,
  wordpress: SiWordpress,
  php: SiPhp,
  mysql: SiMysql,
  git: SiGit,
  figma: SiFigma,
} as const;

export default function AboutTechnologies() {
  return (
    <Section className="section-bg-grey py-20 lg:py-28">
      <Container>
        <AnimatedSection>
          <SectionHeading
            caption="Technologies"
            captionClassName="text-primary"
            title="Modern tools we work with every day"
            description="We use proven, scalable technologies to build fast, secure and future-ready digital products."
          />
        </AnimatedSection>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {aboutTechnologies.map((tech, index) => {
            const Icon = iconMap[tech.icon];

            return (
              <AnimatedSection key={tech.name} delay={index * 0.04}>
                <div className="group flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-4 py-8 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[0_20px_50px_-24px_rgba(0,95,213,0.22)]">
                  <Icon
                    className="h-10 w-10 text-slate-700 transition group-hover:scale-110 group-hover:text-primary"
                    aria-hidden
                  />
                  <p className="mt-4 text-sm font-semibold text-slate-800">
                    {tech.name}
                  </p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
