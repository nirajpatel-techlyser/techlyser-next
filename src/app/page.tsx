import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import FeaturedIn from "@/components/sections/FeaturedIn";
import Services from "@/components/sections/Services";

export default function Home() {
  return (
    <>
      <div className="bg-surface-dark">
        <Navbar />
        <Hero />
      </div>
      <FeaturedIn />
      <Services />
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
