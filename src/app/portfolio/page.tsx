import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import WhyChoose from "@/components/sections/WhyChoose";
import Portfolio from "@/components/sections/Portfolio";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata, collectionPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Shopify Portfolio & Case Studies India",
  description:
    "Explore Techlyser's Shopify and Next.js portfolio — conversion-focused storefronts, migrations, and digital products built for brands across India and worldwide.",
  path: "/portfolio",
  keywords: [
    "Shopify portfolio India",
    "Shopify case studies",
    "ecommerce agency portfolio",
    "Techlyser work",
  ],
});

export default function PortfolioPage() {
  return (
    <>
      <JsonLd
        data={collectionPageJsonLd({
          name: "Portfolio — Techlyser",
          description:
            "Selected Shopify and web projects by Techlyser Web Solutions.",
          path: "/portfolio",
        })}
      />
      <div className="bg-surface-dark">
        <Navbar />
        <Portfolio />
        <WhyChoose />
        <FAQ />
        <CTA />
      </div>
    </>
  );
}
