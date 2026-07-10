import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",

    outline:
      "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100",

    ghost: "text-slate-700 hover:bg-slate-100",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium transition duration-300 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
