export interface Portfolio {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  href: string;
  technologies: string[];
}

export const portfolio: Portfolio[] = [
  {
    id: 1,
    title: "Actizio",
    category: "Shopify Development",
    description:
      "Luxury Ayurvedic ecommerce experience focused on speed, conversions, and premium user experience.",
    image: "/images/portfolio/Actizio.jpg",
    href: "/portfolio/actizio",
    technologies: ["Shopify", "Liquid", "SEO"],
  },
  {
    id: 2,
    title: "Baby Sleep Magic",
    category: "Shopify Plus",
    description:
      "Fashion brand redesign with modern UX, performance optimization, and improved customer journey.",
    image: "/images/portfolio/baby-sleep-magic.jpg",
    href: "/portfolio/baby-sleep-magic",
    technologies: ["Shopify", "UI/UX", "Performance"],
  },
  {
    id: 3,
    title: "Waltgracevintage",
    category: "SEO & Discovery",
    description:
      "Luxury jewellery website optimized for search visibility and high-end shopping experience.",
    image: "/images/portfolio/waltgracevintage.jpg",
    href: "/portfolio/waltgracevintage",
    technologies: ["SEO", "AEO", "GEO"],
  },
  {
    id: 4,
    title: "ORPHIC",
    category: "Next.js Development",
    description:
      "Modern marketing website built with Next.js focusing on speed and accessibility.",
    image: "/images/portfolio/ORPHIC.jpg",
    href: "/portfolio/orphic",
    technologies: ["Next.js", "React", "Tailwind"],
  },
];
