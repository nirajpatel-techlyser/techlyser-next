import Navbar from "@/components/layout/Navbar";

import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";

import Hero from "@/components/sections/Hero";
import FeaturedIn from "@/components/sections/FeaturedIn";
import Services from "@/components/sections/Services";
import WhyChoose from "@/components/sections/WhyChoose";
import Portfolio from "@/components/sections/Portfolio";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
export default function Home() {
  return (
    <>
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
