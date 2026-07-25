"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

interface ServiceDrawIconProps {
  children: ReactNode;
  index?: number;
}

export default function ServiceDrawIcon({
  children,
  index = 0,
}: ServiceDrawIconProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const delay = `${(index % 6) * 0.22}s`;
  const duration = `${2.6 + (index % 3) * 0.4}s`;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const shapes = root.querySelectorAll(
      "path, line, circle, polyline, polygon, rect, ellipse",
    );
    shapes.forEach((shape) => {
      shape.setAttribute("pathLength", "1");
      shape.setAttribute("fill", "none");
    });
  }, []);

  return (
    <span
      ref={ref}
      className="service-icon-draw mb-6 inline-flex text-primary"
      style={
        {
          "--service-icon-delay": delay,
          "--service-icon-duration": duration,
        } as CSSProperties
      }
    >
      {children}
    </span>
  );
}
