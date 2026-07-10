export interface Service {
  id: number;
  title: string;
  description: string;
  href: string;
  icon: string;
}

export const services: Service[] = [
  {
    id: 1,
    title: "Shopify Development",
    description:
      "Custom Shopify stores, theme development, app integration, and scalable ecommerce solutions.",
    href: "/services/shopify-development",
    icon: "⚡",
  },
  {
    id: 2,
    title: "WordPress Development",
    description:
      "Fast, SEO-friendly WordPress websites, blogs, and custom business solutions.",
    href: "/services/wordpress-development",
    icon: "🎨",
  },
  {
    id: 3,
    title: "Next.js Development",
    description:
      "Modern web applications with exceptional performance, SEO, and user experience.",
    href: "/services/nextjs-development",
    icon: "⚡",
  },
  {
    id: 4,
    title: "UI / UX Design",
    description:
      "Clean, user-focused interfaces designed to improve engagement and conversions.",
    href: "/services/ui-ux-design",
    icon: "🎨",
  },
  {
    id: 5,
    title: "Performance Optimization",
    description:
      "Improve Core Web Vitals, page speed, and overall website performance.",
    href: "/services/performance-optimization",
    icon: "⚡",
  },
  {
    id: 6,
    title: "Website Maintenance",
    description:
      "Reliable updates, bug fixes, monitoring, backups, and ongoing technical support.",
    href: "/services/maintenance",
    icon: "🎨",
  },
];
