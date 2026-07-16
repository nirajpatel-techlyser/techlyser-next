import Navbar from "@/components/layout/Navbar";
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
        <Hero />
      </div>
      <FeaturedIn />
      <WhyChoose />
      <Services />

      <Portfolio />
      <FAQ />
      <CTA />
    </>
  );
}
