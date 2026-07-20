import Image from "next/image";
import { aboutTeam } from "@/data/about";
import AnimatedSection from "@/components/about/AnimatedSection";
import { Container, Section, SectionHeading } from "@/components/ui";

export default function AboutTeam() {
  return (
    <Section className="section-bg-grey py-20 lg:py-28">
      <Container>
        <AnimatedSection>
          <SectionHeading
            caption="Meet Our Team"
            captionClassName="text-primary"
            title="The people behind your digital success"
            description="A dedicated team of Shopify experts, developers and designers committed to delivering exceptional results."
          />
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {aboutTeam.map((member, index) => (
            <AnimatedSection key={member.name} delay={index * 0.08}>
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-32px_rgba(15,23,42,0.28)]">
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <div className="flex flex-1 flex-col p-7 lg:p-8">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    {member.role}
                  </p>
                  <p className="mt-4 flex-1 leading-7 text-slate-600">
                    {member.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </Section>
  );
}
