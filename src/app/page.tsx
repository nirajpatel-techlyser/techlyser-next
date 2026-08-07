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
import JsonLd from "@/components/seo/JsonLd";
import { faqItems } from "@/data/faq";
import {
  buildPageMetadata,
  faqPageJsonLd,
  howToJsonLd,
  webPageJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Shopify & Ecommerce Agency India",
  description:
    "Techlyser builds high-performance Shopify stores and Next.js apps for ambitious brands. Best Shopify agency in India — Indore, Mumbai, Ahmedabad, Bangalore, Pune, Delhi, Hyderabad, Chennai, Gujarat, and worldwide.",
  path: "/",
});

export default function Home() {
  const jsonLd = [
    webPageJsonLd({
      name: "Shopify & Ecommerce Agency India | Techlyser",
      description:
        "Premium Shopify, Shopify Plus, Next.js, and AI automation agency in India.",
      path: "/",
    }),
    faqPageJsonLd(
      faqItems.map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
    ),
    howToJsonLd({
      name: "How to start a Shopify project with Techlyser",
      description:
        "A simple path from free audit to launch for Indian ecommerce brands.",
      steps: [
        {
          name: "Book a Free Shopify Growth Audit",
          text: "Share your store URL and goals on the free audit page.",
        },
        {
          name: "Review findings with our team",
          text: "We walk through speed, conversion, UX, and SEO opportunities.",
        },
        {
          name: "Approve a fixed-scope plan",
          text: "Get a clear timeline and quote for theme, migration, or Plus work.",
        },
        {
          name: "Launch and optimize",
          text: "We ship, QA, and continue CRO/performance improvements after go-live.",
        },
      ],
    }),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
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
