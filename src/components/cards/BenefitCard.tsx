import type { Benefit } from "@/data/benefits";

import { Card } from "@/components/ui";

interface BenefitCardProps {
  benefit: Benefit;
}

export default function BenefitCard({ benefit }: BenefitCardProps) {
  const Icon = benefit.icon;

  return (
    <Card className="flex h-full flex-col">
      <div className="mb-6">
        <Icon className="h-12 w-12 text-blue-600" />
      </div>

      <h3 className="text-xl font-semibold text-slate-900">{benefit.title}</h3>

      <p className="mt-4 leading-7 text-slate-600">{benefit.description}</p>
    </Card>
  );
}
