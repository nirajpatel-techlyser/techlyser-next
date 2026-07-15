import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import WhyChoose from "@/components/sections/WhyChoose";
import Portfolio from "@/components/sections/Portfolio";
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <WhyChoose />
      <Portfolio />
      <main className="mx-auto max-w-7xl p-10">
        <h1 className="text-5xl font-bold">Welcome to Techlyser 🚀</h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          Helping businesses build fast, scalable Shopify stores and modern web
          experiences.
        </p>
      </main>
    </>
  );
}
