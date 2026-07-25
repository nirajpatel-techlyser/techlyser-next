import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { services } from "@/data/services";
import { Container, Section } from "@/components/ui";

export default function ServicesListing() {
  return (
    <Section className="section-bg-grey py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-primary">
            What we deliver
          </p>
          <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            Every service, explained
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Pick a capability below to see how we approach the work, what you
            get, and the outcomes we optimize for.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.id}
                className="group flex h-full flex-col overflow-hidden rounded-[5px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgba(255,84,0,0.35)]"
              >
                <Link
                  href={service.href}
                  className="relative block aspect-[16/10] overflow-hidden bg-slate-100"
                >
                  <Image
                    src={service.coverImage}
                    alt={service.coverAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <span className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-[5px] bg-primary text-white shadow-lg">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="font-heading text-xl font-semibold text-slate-900">
                    <Link
                      href={service.href}
                      className="transition hover:text-primary"
                    >
                      {service.title}
                    </Link>
                  </h3>
                  <p className="mt-3 flex-1 leading-7 text-slate-600">
                    {service.description}
                  </p>
                  <Link
                    href={service.href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition group-hover:gap-3"
                  >
                    Explore service
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
