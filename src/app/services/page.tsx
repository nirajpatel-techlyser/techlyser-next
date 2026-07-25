import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import ServicesPageHero from "@/components/services/ServicesPageHero";
import ServicesListing from "@/components/services/ServicesListing";
import CTA from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore Techlyser services — Shopify development, Next.js apps, WordPress, UI/UX design, performance optimization, and SEO & growth.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services | Techlyser Web Solutions",
    description:
      "Shopify, Next.js, WordPress, UI/UX, performance, and SEO services built to help your business grow online.",
    url: "/services",
    type: "website",
  },
};

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
