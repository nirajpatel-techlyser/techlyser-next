import {
  ShoppingBag,
  Code2,
  Globe,
  Palette,
  Gauge,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
export interface Service {
  id: number;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export const services: Service[] = [
  {
    id: 1,
    icon: ShoppingBag,
    title: "Shopify Development",
    description:
      "High-converting Shopify stores designed for speed, scalability, and increased sales.",
    href: "/services/shopify",
  },

  {
    id: 2,
    icon: Code2,
    title: "Next.js Development",
    description:
      "Fast, SEO-friendly web applications built with React and Next.js.",
    href: "/services/nextjs",
  },

  {
    id: 3,
    icon: Globe,
    title: "WordPress Development",
    description:
      "Custom WordPress websites with modern design and easy content management.",
    href: "/services/wordpress",
  },

  {
    id: 4,
    icon: Palette,
    title: "UI / UX Design",
    description:
      "Beautiful user interfaces focused on conversion and usability.",
    href: "/services/ui-ux",
  },

  {
    id: 5,
    icon: Gauge,
    title: "Performance Optimization",
    description: "Improve Core Web Vitals, loading speed, and user experience.",
    href: "/services/performance",
  },

  {
    id: 6,
    icon: TrendingUp,
    title: "SEO & Growth",
    description:
      "Technical SEO and performance strategies to increase visibility.",
    href: "/services/seo",
  },
];
