import { ArrowRight } from "lucide-react";

import { Button, Card } from "@/components/ui";
import ServiceDrawIcon from "@/components/cards/ServiceDrawIcon";

import type { Service } from "@/data/services";

interface ServiceCardProps {
  service: Service;
  index?: number;
}

export default function ServiceCard({ service, index = 0 }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <Card className="flex h-full flex-col">
      <ServiceDrawIcon index={index}>
        <Icon
          className="h-9 w-9 sm:h-12 sm:w-12"
          strokeWidth={1.65}
          absoluteStrokeWidth
          aria-hidden
        />
      </ServiceDrawIcon>

      <h3 className="text-lg font-semibold text-slate-900 sm:text-2xl">
        {service.title}
      </h3>

      <p className="mt-2.5 flex-grow text-sm leading-6 text-slate-600 sm:mt-4 sm:leading-7">
        {service.description}
      </p>

      <Button
        href={service.href}
        variant="ghost"
        className="group mt-5 self-start p-0 text-sm text-primary hover:bg-transparent sm:mt-8"
      >
        Learn More
        <ArrowRight
          size={16}
          className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
        />
      </Button>
    </Card>
  );
}
