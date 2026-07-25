"use client";

import { useEffect, useState } from "react";
import { FaShopify } from "react-icons/fa";

const TAGLINE =
  "If you're ready to design, develop or scale on Shopify we have the solution.";

const TYPE_MS = 72;
const START_DELAY_MS = 600;

type ShopifyExpertsTypewriterProps = {
  className?: string;
};

export default function ShopifyExpertsTypewriter({
  className = "",
}: ShopifyExpertsTypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplayed(TAGLINE);
      setDone(true);
      return;
    }

    let index = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      index += 1;
      setDisplayed(TAGLINE.slice(0, index));

      if (index < TAGLINE.length) {
        // Slight pause on spaces / punctuation feels more natural
        const char = TAGLINE[index - 1];
        const pause =
          char === " " ? TYPE_MS + 40 : /[,.]/.test(char) ? TYPE_MS + 180 : TYPE_MS;
        timeoutId = setTimeout(tick, pause);
      } else {
        setDone(true);
      }
    };

    timeoutId = setTimeout(tick, START_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={`mt-6 max-w-xl ${className}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] bg-[#95bf47] text-white shadow-[0_8px_20px_-10px_rgba(149,191,71,0.8)]">
          <FaShopify className="h-6 w-6" aria-hidden />
        </span>
        <p className="font-heading text-xl font-semibold italic tracking-tight text-hero-fg sm:text-2xl">
          shopify experts
        </p>
      </div>

      <p
        className="mt-3 min-h-[3.25rem] text-sm font-normal leading-6 text-hero-fg-muted sm:text-base sm:leading-7"
        aria-live="polite"
      >
        {displayed}
        <span
          className={`ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] bg-primary align-middle ${
            done ? "animate-pulse opacity-40" : "animate-pulse opacity-100"
          }`}
          aria-hidden
        />
      </p>
    </div>
  );
}
