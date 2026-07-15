"use client";

import Image from "next/image";

const clientLogos = [
  { src: "/images/CLIENT_LOGOS/actizio.png", alt: "Actizio" },
  { src: "/images/CLIENT_LOGOS/baby-sleep-magic.png", alt: "Baby Sleep Magic" },
  { src: "/images/CLIENT_LOGOS/innosupps.png", alt: "Innosupps" },
  { src: "/images/CLIENT_LOGOS/liv-body.png", alt: "Liv Body" },
  { src: "/images/CLIENT_LOGOS/lunalus.png", alt: "Lunalus" },
  { src: "/images/CLIENT_LOGOS/matetea.png", alt: "Mate Tea" },
  { src: "/images/CLIENT_LOGOS/motherly.png", alt: "Motherly" },
  { src: "/images/CLIENT_LOGOS/omg.png", alt: "OMG" },
  { src: "/images/CLIENT_LOGOS/rip.png", alt: "RIP" },
  { src: "/images/CLIENT_LOGOS/trubrain.png", alt: "TruBrain" },
  { src: "/images/CLIENT_LOGOS/waitgrace.png", alt: "Waltgrace" },
] as const;

function LogoTrack({ suffix }: { suffix: string }) {
  return (
    <div className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14">
      {clientLogos.map((logo) => (
        <div
          key={`${logo.alt}-${suffix}`}
          className="relative flex h-10 w-28 shrink-0 items-center justify-center sm:h-12 sm:w-32"
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            fill
            sizes="128px"
            className="object-contain opacity-80 brightness-0"
          />
        </div>
      ))}
    </div>
  );
}

export default function FeaturedIn() {
  return (
    <section className="border-y border-slate-200/80 bg-[#f6f4ef]">
      <div className="relative mx-auto max-w-[90rem] overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
        {/* Logos scroll right → left continuously */}
        <div className="overflow-hidden pl-[7.5rem] sm:pl-[9.5rem] lg:pl-[11rem]">
          <div
            className="logo-marquee"
            style={{
              animation: "logo-marquee-scroll 20s linear infinite",
            }}
          >
            <LogoTrack suffix="a" />
            <LogoTrack suffix="b" />
          </div>
        </div>

        {/* Left heading — logos exit underneath */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-4 sm:pl-6 lg:pl-8">
          <div className="relative flex h-full items-center bg-[#f6f4ef] pr-4 sm:pr-6">
            <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.18em] text-slate-800 sm:text-sm">
              Featured In
            </p>
            <div
              aria-hidden
              className="absolute inset-y-0 left-full w-10 bg-gradient-to-r from-[#f6f4ef] via-[#f6f4ef]/80 to-transparent sm:w-14"
            />
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#f6f4ef] to-transparent sm:w-16"
        />
      </div>
    </section>
  );
}
