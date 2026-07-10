import Link from "next/link";
import Image from "next/image";
import Badge from "../ui/Badge";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Background Glow */}
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-100 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-20 px-6 py-20 lg:grid-cols-2 lg:py-28">
        {/* LEFT CONTENT */}

        <div>
          <Badge> 🚀 Shopify • Next.js • WordPress Agency</Badge>

          <h1 className="mt-8 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Building High-Performance
            <span className="text-blue-600">Ecommerce Experiences</span>
            That Drive Sales.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            We help ambitious businesses grow with Shopify development, modern
            Next.js applications, WordPress solutions, and conversion-focused
            UI/UX.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
            >
              Start Your Project
            </Link>

            <Link
              href="/portfolio"
              className="rounded-xl border px-8 py-4 font-semibold transition hover:bg-gray-100"
            >
              View Portfolio
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <span className="rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-sm">
              ✔ Shopify Expert
            </span>

            <span className="rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-sm">
              ✔ Performance First
            </span>

            <span className="rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-sm">
              ✔ SEO Optimized
            </span>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="relative">
          <div className="relative flex justify-center">
            <Image
              src="/images/tech-hero.png"
              alt="Techlyser"
              width={900}
              height={700}
              priority
              className="mx-auto w-full max-w-2xl drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
