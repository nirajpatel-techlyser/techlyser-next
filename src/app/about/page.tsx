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

import { buildPageMetadata, webPageJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = buildPageMetadata({
  title: "About Techlyser — Indore Shopify Agency",
  description:
    "Meet Techlyser Web Solutions — an Indore-based Shopify web design and development agency helping brands launch, optimize, and scale high-performance digital experiences.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <JsonLd
        data={webPageJsonLd({
          name: "About Techlyser Web Solutions",
          description:
            "Indore-based Shopify web design and development agency helping brands build conversion-focused digital experiences.",
          path: "/about",
          type: "AboutPage",
        })}
      />
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
