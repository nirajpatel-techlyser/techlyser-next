import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import FreeAuditHighlight from "@/components/sections/FreeAuditHighlight";
import FeaturedIn from "@/components/sections/FeaturedIn";
import Services from "@/components/sections/Services";
import WhyChoose from "@/components/sections/WhyChoose";
import Portfolio from "@/components/sections/Portfolio";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
import VideoReviews from "@/components/sections/VideoReviews";
import ShopifyLocationLinks from "@/components/seo/ShopifyLocationLinks";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Shopify & Ecommerce Agency India",
  description:
    "Techlyser builds high-performance Shopify stores and Next.js apps for ambitious brands. Best Shopify agency in India — Indore, Mumbai, Ahmedabad, Bangalore, Gujarat, and worldwide.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <div className="bg-surface-dark">
        <Navbar />
        <Hero />
        <FreeAuditHighlight />

        <FeaturedIn />
        <VideoReviews />
        <WhyChoose />
        <Services />

        <Portfolio limit={4} />
        <ShopifyLocationLinks variant="compact" />
        <FAQ />
        <CTA />
      </div>
    </>
  );
}
