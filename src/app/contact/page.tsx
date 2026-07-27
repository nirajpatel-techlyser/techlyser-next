import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";
import WhyChoose from "@/components/sections/WhyChoose";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Shopify Developers",
  description:
    "Contact Techlyser for Shopify development in India — free consultation, 24hr response. Indore, Mumbai, Ahmedabad, Bangalore, Gujarat, and worldwide.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
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
