import Link from "next/link";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  href?: string;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  href,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-hover",

    outline:
      "rounded-none border border-black bg-transparent text-black hover:bg-black hover:text-white",

    ghost: "text-slate-700 hover:bg-slate-100",
    bg_firstBtn: "",
    bg_secondBtn: "bg-white text-black hover:bg-black hover:text-white",
  };

  const baseClasses =
    "inline-flex items-center justify-center px-6 py-3 font-medium transition duration-300";

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
