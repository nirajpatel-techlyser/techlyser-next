import { FaShopify } from "react-icons/fa";
import { SiNextdotjs } from "react-icons/si";
import { PenTool } from "lucide-react";

const items = [
  {
    label: "Shopify",
    Icon: FaShopify,
    color: "#95BF47",
  },
  {
    label: "Next.js",
    Icon: SiNextdotjs,
    color: "#ffffff",
  },
  {
    label: "Webdesign Agency",
    Icon: PenTool,
    color: "#ff5400",
  },
] as const;

export default function HeroServicesBadge() {
  return (
    <div className="hero-services-badge relative inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-[5px] border border-white/12 bg-white/6 p-1.5 shadow-[0_0_0_1px_rgba(255,84,0,0.08),0_12px_40px_-20px_rgba(255,84,0,0.45)] backdrop-blur-md">
      <span
        aria-hidden
        className="hero-services-badge-sheen pointer-events-none absolute inset-0 overflow-hidden rounded-[5px]"
      />
      <span className="relative flex items-center gap-1.5 rounded-sm bg-primary/15 px-2.5 py-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
          Agency
        </span>
      </span>

      {items.map(({ label, Icon, color }, index) => (
        <span key={label} className="relative flex items-center gap-1">
          {index > 0 && (
            <span
              aria-hidden
              className="mx-0.5 hidden h-3 w-px bg-white/15 sm:block"
            />
          )}
          <span className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm font-medium text-hero-fg transition hover:bg-white/8">
            <Icon
              className="h-3.5 w-3.5 shrink-0"
              style={{ color }}
              aria-hidden
            />
            {label}
          </span>
        </span>
      ))}
    </div>
  );
}
