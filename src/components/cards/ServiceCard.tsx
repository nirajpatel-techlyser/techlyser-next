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
          className="h-12 w-12"
          strokeWidth={1.65}
          absoluteStrokeWidth
          aria-hidden
        />
      </ServiceDrawIcon>

      <h3 className="text-2xl font-semibold text-slate-900">{service.title}</h3>

      <p className="mt-4 flex-grow leading-7 text-slate-600">
        {service.description}
      </p>

      <Button
        href={service.href}
        variant="ghost"
        className="group mt-8 self-start p-0 text-primary hover:bg-transparent"
      >
        Learn More
        <ArrowRight
          size={18}
          className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
        />
      </Button>
    </Card>
  );
}
