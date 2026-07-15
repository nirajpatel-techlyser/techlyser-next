import { Gauge, Rocket, MessageCircle, HeartHandshake } from "lucide-react";

import type { LucideIcon } from "lucide-react";

export interface Benefit {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const benefits: Benefit[] = [
  {
    id: 1,
    title: "Performance First",
    description:
      "Every website is optimized for speed, Core Web Vitals, and SEO from day one.",
    icon: Gauge,
  },
  {
    id: 2,
    title: "Modern Technologies",
    description:
      "Built with Shopify, Next.js, WordPress, and modern frontend best practices.",
    icon: Rocket,
  },
  {
    id: 3,
    title: "Clear Communication",
    description:
      "Regular updates, transparent timelines, and direct collaboration throughout the project.",
    icon: MessageCircle,
  },
  {
    id: 4,
    title: "Long-Term Partnership",
    description:
      "Beyond launch, we help you improve, maintain, and grow your digital presence.",
    icon: HeartHandshake,
  },
];
