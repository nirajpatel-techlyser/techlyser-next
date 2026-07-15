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
    category: "Shopify Migration & Redesign",
    description:
      "A fitness lifestyle brand empowering athletes and fitness enthusiasts with premium activewear and workout accessories. The website focuses on showcasing products through a clean, high-performance ecommerce experience.",
    image: "/images/portfolio/Actizio.jpg",
    href: "https://actizio.com/",
    technologies: ["Fitness", "Clothing", "D2C"],
  },
  {
    id: 2,
    title: "MATETEA",
    category: "Shopify Redesign, SEO & AI Discovery (AEO & GEO)",
    description:
      "Premium Danish tea brand blending traditional South American yerba mate culture with Nordic minimalism. The ecommerce experience showcases high-quality teas through a clean, modern, and conversion-focused shopping journey.",
    image: "/images/portfolio/matetea.jpg",
    href: "https://matetea.dk/",
    technologies: ["Shopify", "UI/UX", "Tea", "Wellness"],
  },
  {
    id: 3,
    title: "MOTHERLY",
    category: "Shopify Migration & Redesign, SEO & Discovery",
    description:
      "Ecommerce website for a lifestyle brand dedicated to supporting new mothers and their little ones with carefully selected maternity and baby products. Designed for effortless browsing, fast performance, and a smooth customer experience.",
    image: "/images/portfolio/Motherlystore.jpg",
    href: "https://motherlystore.com/",
    technologies: ["Shopify", "Maternity", "AEO", "Baby Products"],
  },
  {
    id: 4,
    title: "ORPHIC NUTRITION",
    category: "Shopify Development & SEO",
    description:
      "High-performance ecommerce store for a premium nutrition brand offering supplements and wellness products to support active lifestyles and everyday health. Designed with a clean shopping experience focused on trust, usability, and conversions.",
    image: "/images/portfolio/ORPHIC.jpg",
    href: "/portfolio/orphic",
    technologies: ["Shopify", "Nutrition", "Supplements", "CRO"],
  },
];
