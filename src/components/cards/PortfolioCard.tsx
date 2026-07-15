import Image from "next/image";
import { ArrowRight } from "lucide-react";

import type { Portfolio } from "@/data/portfolio";

import { Button, Card, Tag } from "@/components/ui";

interface PortfolioCardProps {
  project: Portfolio;
  index: number;
}

export default function PortfolioCard({ project, index }: PortfolioCardProps) {
  const heights = ["h-[520px]", "h-[380px]", "h-[460px]"];
  const imageHeight = index % 2 === 0 ? "h-[650px]" : "h-[650px]";

  const offsetClass = index % 2 !== 0 ? "lg:mt-24" : "";
  return (
    <article className="">
      {/* Project Image */}

      <div className={`group overflow-hidden ${imageHeight}`}>
        <Image
          src={project.image}
          alt={project.title}
          width={1040}
          height={1024}
          className={`w-full ${imageHeight}  object-cover object-[center_35%] transition duration-700 group-hover:scale-105`}
        />
      </div>

      {/* Content */}

      <div className="pt-8 ">
        {/* Tags */}

        <div className="mb-5 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <Tag
              className="
    border-blue-100
    bg-blue-50
    text-blue-700
  "
              key={tech}
            >
              {tech}
            </Tag>
          ))}
        </div>

        {/* Title */}

        <h3 className="mt-3 text-2xl font-bold text-slate-900 group-hover:text-blue-600">
          {project.title}
        </h3>

        {/* Category */}

        <p className="text-sm font-medium uppercase tracking-wider text-blue-600">
          {project.category}
        </p>

        {/* Description */}

        <p className="mt-3 leading-7 text-slate-600">{project.description}</p>

        {/* Button */}

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
