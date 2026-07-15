import { ArrowRight } from "lucide-react";

import { Button, Card } from "@/components/ui";

import type { Service } from "@/data/services";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const Icon = service.icon;
  return (
    <Card className="flex h-full flex-col">
      <div className="mb-6 text-5xl">
        <Icon className="h-12 w-12 text-blue-600" />
      </div>

      <h3 className="text-2xl font-semibold text-slate-900">{service.title}</h3>

      <p className="mt-4 flex-grow leading-7 text-slate-600">
        {service.description}
      </p>

      <Button
        href={service.href}
        variant="ghost"
        className="group mt-8 self-start p-0 text-blue-600 hover:bg-transparent"
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
