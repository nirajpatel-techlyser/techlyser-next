import Image from "next/image";
import { ArrowRight } from "lucide-react";

import type { Portfolio } from "@/data/portfolio";

import { Button, Tag } from "@/components/ui";

interface PortfolioCardProps {
  project: Portfolio;
  index: number;
}

export default function PortfolioCard({ project }: PortfolioCardProps) {
  return (
    <article className="group">
      <div
        className="
          relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50
          aspect-[4/3] max-h-[min(72vw,420px)] w-full
          sm:aspect-[16/10] sm:max-h-[480px]
          lg:aspect-auto lg:max-h-none lg:h-[520px] xl:h-[560px]
        "
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="
            object-contain object-center p-2
            transition duration-700 group-hover:scale-[1.02]
            lg:object-cover lg:object-[center_30%] lg:p-0
          "
        />
      </div>

      <div className="pt-6 sm:pt-8">
        <div className="mb-5 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <Tag
              className="border-blue-100 bg-primary-soft text-blue-700"
              key={tech}
            >
              {tech}
            </Tag>
          ))}
        </div>

        <h3 className="mt-3 text-2xl font-bold text-slate-900 group-hover:text-primary">
          {project.title}
        </h3>

        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          {project.category}
        </p>

        <p className="mt-3 leading-7 text-slate-600">{project.description}</p>

        <Button href={project.href} variant="outline" className="mt-3 p-0">
          View Case Study
          <ArrowRight
            size={18}
            className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
          />
        </Button>
      </div>
    </article>
  );
}
