import type { Benefit } from "@/data/benefits";

import { Card } from "@/components/ui";

interface BenefitCardProps {
  benefit: Benefit;
}

export default function BenefitCard({ benefit }: BenefitCardProps) {
  const Icon = benefit.icon;

  return (
    <Card className="flex h-full flex-col">
      <div className="mb-4 sm:mb-6">
        <Icon className="h-9 w-9 text-primary sm:h-12 sm:w-12" />
      </div>

      <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
        {benefit.title}
      </h3>

      <p className="mt-2.5 text-sm leading-6 text-slate-600 sm:mt-4 sm:leading-7">
        {benefit.description}
      </p>
    </Card>
  );
}
