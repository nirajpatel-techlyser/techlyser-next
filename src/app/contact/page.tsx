import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";
import WhyChoose from "@/components/sections/WhyChoose";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
import { buildPageMetadata, webPageJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Shopify Developers",
  description:
    "Contact Techlyser Web Solutions, an Indore-based Shopify web design and development agency. Free consultation and typically a response within 24 hours.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          name: "Contact Techlyser",
          description:
            "Contact Techlyser for Shopify, Next.js, and ecommerce projects in India.",
          path: "/contact",
          type: "ContactPage",
        })}
      />
      <div className="bg-surface-dark">
        <Navbar />
        <ContactHero />
        <ContactForm />

        <WhyChoose />
        <FAQ />
        <CTA />
      </div>
    </>
  );
}
