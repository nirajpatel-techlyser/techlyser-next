import Link from "next/link";
import { Service } from "@/data/services";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="mb-6 text-5xl">{service.icon}</div>

      <h3 className="text-2xl font-semibold">{service.title}</h3>

      <p className="mt-4 flex-grow leading-7 text-gray-600">
        {service.description}
      </p>

      <Link
        href={service.href}
        className="mt-8 inline-flex items-center font-medium text-primary hover:gap-3 transition-all"
      >
        Learn More →
      </Link>
    </div>
  );
}
