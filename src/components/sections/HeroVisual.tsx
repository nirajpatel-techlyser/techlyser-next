"use client";

import Image from "next/image";
import type { ComponentType, CSSProperties } from "react";
import {
  FaShopify,
  FaReact,
  FaWordpress,
  FaAngular,
  FaSearchDollar,
  FaNodeJs,
} from "react-icons/fa";
import { SiNextdotjs, SiTypescript } from "react-icons/si";
import { Gauge, ShoppingBag, TrendingUp } from "lucide-react";

const shipItems = [
  {
    Icon: ShoppingBag,
    title: "Shopify Plus stores",
    meta: "Theme + apps + checkout",
  },
  {
    Icon: Gauge,
    title: "Performance first",
    meta: "Core Web Vitals ready",
  },
  {
    Icon: FaSearchDollar,
    title: "SEO architecture",
    meta: "Structure that ranks",
  },
  {
    Icon: TrendingUp,
    title: "Conversion UX",
    meta: "Designed to sell",
  },
] as const;

const products = [
  {
    name: "Bags",
    src: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=240&h=240&q=80",
  },
  {
    name: "Watches",
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=240&h=240&q=80",
  },
  {
    name: "Essentials",
    src: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=240&h=240&q=80",
  },
];

const desktopIcons = [
  {
    label: "Angular",
    Icon: FaAngular,
    color: "#DD0031",
    bg: "rgba(221, 0, 49, 0.18)",
    position: "left-[12%] top-[-2%]",
    size: "h-12 w-12",
    iconSize: "h-5 w-5",
    delay: "0.2s",
    duration: "3.4s",
  },
  {
    label: "TypeScript",
    Icon: SiTypescript,
    color: "#3178C6",
    bg: "rgba(49, 120, 198, 0.2)",
    position: "right-[18%] top-[-4%]",
    size: "h-12 w-12",
    iconSize: "h-5 w-5",
    delay: "0.5s",
    duration: "3.7s",
  },
  {
    label: "Next.js",
    Icon: SiNextdotjs,
    color: "#111111",
    bg: "#ffffff",
    position: "right-[0%] top-[12%]",
    size: "h-12 w-12",
    iconSize: "h-6 w-6",
    delay: "0.8s",
    duration: "3.9s",
  },
  {
    label: "WordPress",
    Icon: FaWordpress,
    color: "#21759B",
    bg: "rgba(33, 117, 155, 0.22)",
    position: "right-[-1%] bottom-[34%]",
    size: "h-12 w-12",
    iconSize: "h-6 w-6",
    delay: "1.1s",
    duration: "4.1s",
  },
  {
    label: "React",
    Icon: FaReact,
    color: "#61DAFB",
    bg: "rgba(97, 218, 251, 0.18)",
    position: "left-[-3%] bottom-[38%]",
    size: "h-14 w-14",
    iconSize: "h-7 w-7",
    delay: "0.35s",
    duration: "3.5s",
  },
  {
    label: "Node.js",
    Icon: FaNodeJs,
    color: "#339933",
    bg: "rgba(51, 153, 51, 0.2)",
    position: "left-[8%] top-[18%]",
    size: "h-12 w-12",
    iconSize: "h-6 w-6",
    delay: "0.65s",
    duration: "3.8s",
  },
  {
    label: "Shopify",
    Icon: FaShopify,
    color: "#95BF47",
    bg: "rgba(149, 191, 71, 0.22)",
    position: "left-[-2%] bottom-[12%]",
    size: "h-14 w-14",
    iconSize: "h-7 w-7",
    delay: "0s",
    duration: "3.2s",
  },
];

const mobileIcons = [
  {
    label: "Shopify",
    Icon: FaShopify,
    color: "#95BF47",
    bg: "rgba(149, 191, 71, 0.22)",
    position: "left-0 top-1",
    delay: "0s",
    duration: "3.2s",
  },
  {
    label: "React",
    Icon: FaReact,
    color: "#61DAFB",
    bg: "rgba(97, 218, 251, 0.18)",
    position: "right-0 top-0",
    delay: "0.35s",
    duration: "3.5s",
  },
  {
    label: "Next.js",
    Icon: SiNextdotjs,
    color: "#111111",
    bg: "#ffffff",
    position: "right-1 bottom-14",
    delay: "0.8s",
    duration: "3.9s",
  },
];

function FloatingIcon({
  label,
  Icon,
  color,
  bg,
  position,
  size,
  iconSize,
  delay,
  duration,
}: {
  label: string;
  Icon: ComponentType<{
    className?: string;
    style?: CSSProperties;
    "aria-label"?: string;
  }>;
  color: string;
  bg: string;
  position: string;
  size: string;
  iconSize: string;
  delay: string;
  duration: string;
}) {
  return (
    <div
      className={`hero-icon-bounce absolute z-30 ${position}`}
      style={{ animationDuration: duration, animationDelay: delay }}
      title={label}
    >
      <div
        className={`flex ${size} items-center justify-center rounded-2xl border border-white/25 backdrop-blur-md`}
        style={{
          backgroundColor: bg,
          boxShadow: `0 14px 36px ${color}55, 0 0 0 1px rgba(255,255,255,0.14)`,
        }}
      >
        <Icon className={iconSize} style={{ color }} aria-label={label} />
      </div>
    </div>
  );
}

function BrowserChrome({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 border-b border-white/10 bg-white/5 ${
        compact ? "px-2.5 py-1.5" : "px-4 py-3"
      }`}
    >
      <span className={`${compact ? "h-2 w-2" : "h-2.5 w-2.5"} rounded-full bg-[#ff5f57]`} />
      <span className={`${compact ? "h-2 w-2" : "h-2.5 w-2.5"} rounded-full bg-[#febc2e]`} />
      <span className={`${compact ? "h-2 w-2" : "h-2.5 w-2.5"} rounded-full bg-[#28c840]`} />
      <div
        className={`ml-2 flex min-w-0 flex-1 items-center rounded-[5px] bg-white/5 text-hero-fg-muted ${
          compact ? "px-2 py-1 text-[9px]" : "px-3 py-1.5 text-[11px]"
        }`}
      >
        techlyser.com/store
      </div>
      {!compact && (
        <div className="hidden items-center gap-2 sm:flex">
          <div className="rounded-[5px] border border-white/10 bg-white/10 px-2.5 py-1">
            <p className="text-[9px] leading-none text-hero-fg-muted">Lighthouse</p>
            <p className="text-xs font-semibold text-primary">95+</p>
          </div>
          <div className="rounded-[5px] border border-white/10 bg-white/10 px-2.5 py-1">
            <p className="text-[9px] leading-none text-hero-fg-muted">Projects</p>
            <p className="text-xs font-semibold text-hero-fg">700+</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** Wide / horizontal mockup for phones */
function HeroVisualMobile() {
  return (
    <div className="relative mx-auto w-full lg:hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      {mobileIcons.map((icon) => (
        <FloatingIcon
          key={icon.label}
          {...icon}
          size="h-8 w-8"
          iconSize="h-4 w-4"
        />
      ))}

      <div className="relative z-10 mx-auto w-[96%] pb-9">
        <div className="overflow-hidden rounded-[10px] border border-white/12 bg-[#0b0b0b]/85 shadow-[0_24px_60px_-20px_rgba(255,84,0,0.45)] backdrop-blur-xl">
          <BrowserChrome compact />

          <div className="p-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-[#95bf47] text-white">
                  <FaShopify className="h-2.5 w-2.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-medium leading-tight text-hero-fg">
                    Premium Storefront
                  </p>
                  <p className="text-[8px] leading-tight text-hero-fg-muted">
                    Custom Shopify build
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="rounded-[4px] bg-white/10 px-1.5 py-0.5 text-[8px] font-semibold text-primary">
                  95+
                </span>
                <span className="rounded-[4px] bg-primary/15 px-1.5 py-0.5 text-[8px] font-medium text-primary">
                  Live
                </span>
              </div>
            </div>

            <div className="rounded-[5px] bg-gradient-to-br from-[#1a1a1a] to-[#111] p-1.5 ring-1 ring-white/10">
              <div className="grid grid-cols-3 gap-1">
                {products.map((item) => (
                  <div
                    key={item.name}
                    className="relative aspect-[2/1] overflow-hidden rounded-[4px] ring-1 ring-white/10"
                  >
                    <Image
                      src={item.src}
                      alt={item.name}
                      fill
                      sizes="110px"
                      className="object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-1 py-0.5">
                      <span className="text-[8px] font-medium text-white">
                        {item.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Full mockup for tablet/desktop */
function HeroVisualDesktop() {
  return (
    <div className="relative mx-auto hidden w-full max-w-xl lg:block lg:max-w-none">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      {desktopIcons.map((icon) => (
        <FloatingIcon key={icon.label} {...icon} />
      ))}

      <div className="relative z-10 mx-auto w-[88%] pb-14">
        <div className="overflow-hidden rounded-[16px] border border-white/12 bg-[#0b0b0b]/85 shadow-[0_34px_90px_-24px_rgba(255,84,0,0.5)] backdrop-blur-xl">
          <BrowserChrome />

          <div className="grid gap-0 md:grid-cols-[1.3fr_0.9fr]">
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[5px] bg-[#95bf47] text-white">
                    <FaShopify className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-hero-fg">
                      Premium Storefront
                    </p>
                    <p className="text-[10px] text-hero-fg-muted">
                      Custom Shopify build
                    </p>
                  </div>
                </div>
                <span className="rounded-[5px] bg-primary/15 px-2 py-1 text-[10px] font-medium text-primary">
                  Live
                </span>
              </div>

              <div className="rounded-[5px] bg-gradient-to-br from-[#1a1a1a] to-[#111] p-4 ring-1 ring-white/10">
                <p className="text-[10px] uppercase tracking-[0.16em] text-hero-fg-muted">
                  Featured collection
                </p>
                <p className="mt-1 font-heading text-lg font-semibold text-hero-fg">
                  Conversion-ready catalog
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {products.map((item) => (
                    <div
                      key={item.name}
                      className="relative aspect-square overflow-hidden rounded-[5px] ring-1 ring-white/10"
                    >
                      <Image
                        src={item.src}
                        alt={item.name}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                        <span className="text-[10px] font-medium text-white">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-brand mt-4 w-full rounded-[5px] px-3 py-2 text-xs font-medium"
                >
                  Shop Now
                </button>
              </div>
            </div>

            <div className="space-y-3 border-l border-white/10 bg-white/[0.03] p-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                What we ship
              </p>

              {shipItems.map(({ Icon, title, meta }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-[5px] border border-white/10 bg-black/20 p-3"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-primary/15 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-hero-fg">{title}</p>
                    <p className="text-[11px] text-hero-fg-muted">{meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroVisual() {
  return (
    <>
      <HeroVisualMobile />
      <HeroVisualDesktop />
    </>
  );
}
