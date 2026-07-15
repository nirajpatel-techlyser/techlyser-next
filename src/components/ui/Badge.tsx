import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export default function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary ${className}`}
    >
      {children}
    </span>
  );
}
