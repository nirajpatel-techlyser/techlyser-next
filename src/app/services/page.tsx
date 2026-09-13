import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import ServicesPageHero from "@/components/services/ServicesPageHero";
import ServicesListing from "@/components/services/ServicesListing";
import CTA from "@/components/sections/CTA";
import JsonLd from "@/components/seo/JsonLd";
import { services } from "@/data/services";
import { buildPageMetadata, serviceCatalogJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Web & Shopify Services",
  description:
    "Explore Techlyser services — Shopify development, Next.js apps, WordPress, UI/UX design, performance optimization, and SEO from an Indore-based agency.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <JsonLd
        data={serviceCatalogJsonLd(
          services.map((service) => ({
            name: service.title,
            description: service.description,
            url: service.href,
          })),
        )}
      />
      <Navbar />
      <main>
        <ServicesPageHero />
        <ServicesListing />
        <CTA />
      </main>
    </div>
  );
}
