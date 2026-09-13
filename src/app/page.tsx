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
  title: "Shopify Web Design & Development Agency in Indore | Techlyser",
  description:
    "Techlyser Web Solutions is an Indore-based Shopify web design and development agency helping DTC and e-commerce brands build fast, responsive and conversion-focused online stores.",
  path: "/",
});

export default function Home() {
  const jsonLd = [
    webPageJsonLd({
      name: "Shopify Web Design & Development Agency in Indore | Techlyser",
      description:
        "Indore-based Shopify web design and development agency helping DTC and ecommerce brands build fast, conversion-focused online stores.",
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
        "A simple path from free audit to launch for ecommerce brands working with Techlyser in Indore.",
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
