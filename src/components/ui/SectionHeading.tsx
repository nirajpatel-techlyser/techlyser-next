import Badge from "./Badge";
import { ReactNode } from "react";

interface SectionHeadingProps {
  caption: string;
  badge?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  captionClassName?: string;
  /** Semantic heading level — visual styles stay identical. Default h2. */
  as?: "h1" | "h2" | "h3";
}

export default function SectionHeading({
  caption,
  badge,
  title,
  description,
  align = "center",
  captionClassName = "text-primary",
  as = "h2",
}: SectionHeadingProps) {
  const HeadingTag = as;
  const headingClassName =
    "mt-3 font-heading text-2xl font-semibold tracking-tight text-heading sm:mt-5 sm:text-4xl lg:text-5xl";

  return (
    <div
      className={`mx-auto mb-8 max-w-3xl sm:mb-12 lg:mb-16 ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {badge && <Badge>{badge}</Badge>}

      {caption && (
        <p
          className={`text-[11px] font-medium uppercase tracking-[0.28em] sm:text-sm sm:tracking-[0.3em] ${captionClassName}`}
        >
          {caption}
        </p>
      )}

      {title && <HeadingTag className={headingClassName}>{title}</HeadingTag>}

      {description && (
        <p className="mt-3 text-sm font-normal leading-6 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
          {description}
        </p>
      )}
    </div>
  );
}
