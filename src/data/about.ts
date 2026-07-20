export const aboutHero = {
  title: "We Build Digital Experiences That Grow Businesses.",
  description:
    "Techlyser is a team of passionate Shopify and Web Development experts helping businesses launch, optimize and scale their online presence with high-performance websites and custom solutions.",
  primaryCta: { label: "Let's Talk", href: "/contact" },
  secondaryCta: { label: "View Our Work", href: "/portfolio" },
};

export const aboutStory = {
  title: "Our Story",
  paragraphs: [
    "Techlyser started with a simple mission—to build websites that are not only visually stunning but also deliver measurable business results.",
    "Over the years we've helped startups, entrepreneurs and established brands create modern Shopify stores, business websites and custom web applications.",
    "Today we continue helping businesses across the globe with reliable development, long-term support and scalable digital solutions.",
  ],
};

export const aboutWhyChoose = [
  {
    icon: "rocket",
    title: "Shopify Experts",
    description:
      "Custom Shopify stores, Shopify Plus, Liquid development and theme customization.",
  },
  {
    icon: "zap",
    title: "Performance First",
    description:
      "Fast loading websites optimized for SEO, Core Web Vitals and conversions.",
  },
  {
    icon: "palette",
    title: "UI/UX Focused",
    description:
      "Clean interfaces designed to improve customer experience and increase sales.",
  },
  {
    icon: "handshake",
    title: "Long-Term Partnership",
    description:
      "We don't just build websites—we become your technology partner.",
  },
] as const;

export const aboutTeam = [
  {
    name: "Niraj Singh",
    role: "Senior Shopify Expert",
    image: "/images/team/niraj.png",
    description:
      "Niraj leads Shopify design and development projects with extensive experience in custom themes, Shopify Plus, Liquid development, store optimization, performance improvements and conversion-focused user experiences. He works closely with clients to transform business ideas into scalable eCommerce solutions.",
    skills: [
      "Shopify",
      "Shopify Plus",
      "Liquid",
      "Theme Development",
      "Custom Apps",
      "Store Optimization",
    ],
  },
  {
    name: "Devendra",
    role: "Senior Shopify Developer",
    image: "/images/team/devendra.png",
    description:
      "Devendra specializes in Shopify development, custom functionality, API integrations and performance optimization. He focuses on creating reliable, scalable and user-friendly eCommerce experiences while maintaining clean and maintainable code.",
    skills: [
      "Shopify Development",
      "Theme Customization",
      "API Integration",
      "JavaScript",
      "Performance Optimization",
    ],
  },
  {
    name: "Anurag Tripathi",
    role: "Frontend Web Developer",
    image: "/images/team/anurag.png",
    description:
      "Anurag develops modern, responsive and interactive user interfaces using the latest frontend technologies. His attention to detail ensures every website delivers an exceptional experience across desktop, tablet and mobile devices.",
    skills: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "Tailwind CSS",
      "React",
      "Responsive Design",
    ],
  },
] as const;

export const aboutStats = [
  { value: 150, suffix: "+", label: "Projects Delivered" },
  { value: 100, suffix: "+", label: "Shopify Stores" },
  { value: 8, suffix: "+", label: "Years Experience" },
  { value: 99, suffix: "%", label: "Client Satisfaction" },
] as const;

export const aboutTechnologies = [
  { name: "Shopify", icon: "shopify" },
  { name: "Next.js", icon: "nextjs" },
  { name: "React", icon: "react" },
  { name: "Tailwind CSS", icon: "tailwind" },
  { name: "TypeScript", icon: "typescript" },
  { name: "Node.js", icon: "nodejs" },
  { name: "WordPress", icon: "wordpress" },
  { name: "PHP", icon: "php" },
  { name: "MySQL", icon: "mysql" },
  { name: "Git", icon: "git" },
  { name: "Figma", icon: "figma" },
] as const;

export const aboutProcess = [
  {
    step: 1,
    title: "Discovery",
    description: "Understand business goals.",
  },
  {
    step: 2,
    title: "Design",
    description: "Create modern UI/UX.",
  },
  {
    step: 3,
    title: "Development",
    description: "Build scalable solutions.",
  },
  {
    step: 4,
    title: "Launch & Support",
    description: "Deploy, optimize and provide long-term support.",
  },
] as const;
