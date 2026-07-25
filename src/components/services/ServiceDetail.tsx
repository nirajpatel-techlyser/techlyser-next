import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import type { Service } from "@/data/services";
import { services } from "@/data/services";
import { Badge, Container, Section } from "@/components/ui";

interface ServiceDetailProps {
  service: Service;
}

export default function ServiceDetail({ service }: ServiceDetailProps) {
  const Icon = service.icon;
  const related = services
    .filter((item) => item.slug !== service.slug)
    .slice(0, 3);

  return (
    <>
      <Section className="relative overflow-hidden bg-surface-dark text-hero-fg">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
        />
        <Container className="relative z-10 py-14 sm:py-18 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="border border-white/10 bg-white/8 text-primary">
                  Service
                </Badge>
                <span className="inline-flex items-center gap-2 text-sm text-hero-fg-muted">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  {service.title}
                </span>
              </div>
              <h1 className="mt-5 font-heading text-3xl font-semibold leading-tight tracking-tight text-hero-fg sm:text-4xl lg:text-[2.75rem]">
                {service.heroHeadline}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-hero-fg-muted">
                {service.intro}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="btn-brand rounded-[5px] px-7 py-3.5 text-center shadow-[0_12px_28px_-12px_rgba(255,0,0,0.55)]"
                >
                  Discuss this service
                </Link>
                <Link
                  href="/services"
                  className="rounded-[5px] border border-white/15 px-7 py-3.5 text-center font-medium text-hero-fg transition hover:bg-white/5"
                >
                  All services
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-[5px] border border-white/10 shadow-[0_30px_80px_-30px_rgba(255,84,0,0.55)]">
              <Image
                src={service.coverImage}
                alt={service.coverAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">
              Overview
            </p>
            <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-slate-900">
              How we approach {service.title.toLowerCase()}
            </h2>
            <div className="mt-6 space-y-5 text-lg leading-8 text-slate-600">
              {service.overview.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="section-bg-grey py-16 sm:py-20">
        <Container>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">
              Why it matters
            </p>
            <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-heading">
              Benefits you can feel in the business
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {service.benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-[5px] border border-slate-200 bg-white p-7 shadow-sm"
              >
                <h3 className="font-heading text-xl font-semibold text-slate-900">
                  {benefit.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">
                Deliverables
              </p>
              <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-slate-900">
                What you walk away with
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Clear scope, tangible outputs, and a path from kickoff to launch
                — tailored to {service.title}.
              </p>
              <ul className="mt-8 space-y-3">
                {service.deliverables.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-slate-700"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="leading-7">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">
                Process
              </p>
              <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-slate-900">
                A simple path from idea to live
              </h2>
              <ol className="mt-8 space-y-5">
                {service.process.map((step) => (
                  <li
                    key={step.step}
                    className="rounded-[5px] border border-slate-200 bg-slate-50 p-5 sm:p-6"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-heading text-sm font-semibold text-primary">
                        {step.step}
                      </span>
                      <h3 className="font-heading text-lg font-semibold text-slate-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-2 leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="section-bg-grey py-16 sm:py-20">
        <Container>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">
              Visuals
            </p>
            <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-heading">
              Related imagery & inspiration
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              A glimpse of the environments, products, and digital moments this
              service is built around.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
            {service.gallery.map((image, index) => (
              <div
                key={image.src}
                className={`relative overflow-hidden rounded-[5px] ${
                  index === 0 ? "sm:col-span-2 aspect-[21/9]" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">
                More services
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-slate-900">
                Keep exploring
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              View all services
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((item) => {
              const RelatedIcon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group overflow-hidden rounded-[5px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={item.coverImage}
                      alt={item.coverAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-primary">
                      <RelatedIcon className="h-4 w-4" aria-hidden />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Service
                      </span>
                    </div>
                    <h3 className="mt-2 font-heading text-lg font-semibold text-slate-900 group-hover:text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>
    </>
  );
}
