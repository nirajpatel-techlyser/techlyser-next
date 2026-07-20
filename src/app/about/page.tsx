import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import AboutHero from "@/components/about/AboutHero";
import AboutStory from "@/components/about/AboutStory";
import AboutWhyChoose from "@/components/about/AboutWhyChoose";
import AboutTeam from "@/components/about/AboutTeam";
import AboutStats from "@/components/about/AboutStats";
import AboutTechnologies from "@/components/about/AboutTechnologies";
import AboutProcess from "@/components/about/AboutProcess";
import CTA from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "About Us | Techlyser Web Solutions",
  description:
    "Meet Techlyser — a premium Shopify and web development agency helping businesses launch, optimize and scale with high-performance digital experiences.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Techlyser Web Solutions",
    description:
      "Meet the Techlyser team of Shopify experts, developers and designers building modern digital experiences for growing businesses.",
    url: "/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <AboutHero />
        <AboutStory />
        <AboutWhyChoose />
        <AboutTeam />
        <AboutStats />
        <AboutTechnologies />
        <AboutProcess />
        <CTA />
      </main>
    </div>
  );
}
