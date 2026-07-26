import { FaShopify } from "react-icons/fa";
import { SiNextdotjs } from "react-icons/si";
import { PenTool } from "lucide-react";

const items = [
  {
    label: "Shopify",
    shortLabel: "Shopify",
    Icon: FaShopify,
    color: "#95BF47",
  },
  {
    label: "Next.js",
    shortLabel: "Next.js",
    Icon: SiNextdotjs,
    color: "#ffffff",
  },
  {
    label: "Webdesign Agency",
    shortLabel: "Web Design",
    Icon: PenTool,
    color: "#ff5400",
  },
] as const;

export default function HeroServicesBadge() {
  return (
    <div className="hero-services-badge relative inline-flex max-w-full flex-nowrap items-center gap-0.5 overflow-x-auto rounded-[5px] border border-white/12 bg-white/6 p-0.5 shadow-[0_0_0_1px_rgba(255,84,0,0.08),0_12px_40px_-20px_rgba(255,84,0,0.45)] backdrop-blur-md sm:gap-1.5 sm:overflow-visible sm:p-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <span
        aria-hidden
        className="hero-services-badge-sheen pointer-events-none absolute inset-0 overflow-hidden rounded-[5px]"
      />
      <span className="relative flex shrink-0 items-center gap-1 rounded-sm bg-primary/15 px-1.5 py-1 sm:gap-1.5 sm:px-2.5 sm:py-1.5">
        <span className="relative flex h-1 w-1 sm:h-1.5 sm:w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-1 w-1 rounded-full bg-primary sm:h-1.5 sm:w-1.5" />
        </span>
        <span className="text-[8px] font-semibold uppercase tracking-[0.08em] text-primary sm:text-[10px] sm:tracking-[0.14em]">
          Agency
        </span>
      </span>

      {items.map(({ label, shortLabel, Icon, color }, index) => (
        <span key={label} className="relative flex shrink-0 items-center gap-0.5">
          {index > 0 && (
            <span
              aria-hidden
              className="mx-0.5 hidden h-3 w-px bg-white/15 sm:block"
            />
          )}
          <span className="inline-flex items-center gap-0.5 rounded-sm px-1 py-1 text-[10px] font-medium leading-none text-hero-fg transition hover:bg-white/8 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-sm">
            <Icon
              className="h-2.5 w-2.5 shrink-0 sm:h-3.5 sm:w-3.5"
              style={{ color }}
              aria-hidden
            />
            <span className="sm:hidden">{shortLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </span>
        </span>
      ))}
    </div>
  );
}
