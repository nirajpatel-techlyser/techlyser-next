import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({
  children,
  className = "Container-testing-class",
}: ContainerProps) {
  return (
    <div className={`mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
