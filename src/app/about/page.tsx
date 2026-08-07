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

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About Techlyser — Shopify Agency India",
  description:
    "Meet Techlyser — a premium Shopify, Shopify Plus, Next.js, and AI automation agency in India helping brands launch, optimize, and scale high-performance digital experiences.",
  path: "/about",
  keywords: [
    "About Techlyser",
    "Shopify agency India team",
    "Shopify experts Indore",
  ],
});

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
