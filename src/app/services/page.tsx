import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import ServicesPageHero from "@/components/services/ServicesPageHero";
import ServicesListing from "@/components/services/ServicesListing";
import CTA from "@/components/sections/CTA";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Web & Shopify Services",
  description:
    "Explore Techlyser services — Shopify development India, Next.js apps, WordPress, UI/UX design, performance optimization, and SEO & growth.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <ServicesPageHero />
        <ServicesListing />
        <CTA />
      </main>
    </div>
  );
}
