import Badge from "./Badge";
import { ReactNode } from "react";

interface SectionHeadingProps {
  caption: string;
  badge?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  captionClassName?: string;
}

export default function SectionHeading({
  caption,
  badge,
  title,
  description,
  align = "center",
  captionClassName = "text-primary",
}: SectionHeadingProps) {
  return (
    <div
      className={`mx-auto mb-16 max-w-3xl ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {badge && <Badge>{badge}</Badge>}

      {caption && (
        <p
          className={`text-sm font-medium uppercase tracking-[0.3em] ${captionClassName}`}
        >
          {caption}
        </p>
      )}

      {title && (
        <h2 className="mt-6 text-4xl font-semibold tracking-tight text-heading lg:text-5xl">
          {title}
        </h2>
      )}

      {description && (
        <p className="mt-6 text-lg font-normal leading-8 text-slate-600">{description}</p>
      )}
    </div>
  );
}
