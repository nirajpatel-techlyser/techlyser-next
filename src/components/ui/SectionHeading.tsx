import Badge from "./Badge";
import { ReactNode } from "react";

interface SectionHeadingProps {
  caption: string;
  badge?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  caption,
  badge,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  return (
    <div
      className={`mx-auto mb-16 max-w-3xl ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {badge && <Badge>{badge}</Badge>}

      {caption && (
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
          {caption}
        </p>
      )}

      {title && (
        <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
          {title}
        </h2>
      )}

      {description && (
        <p className="mt-6 text-lg leading-8 text-slate-600">{description}</p>
      )}
    </div>
  );
}
