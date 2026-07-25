import Link from "next/link";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost" | "bg_firstBtn" | "bg_secondBtn";
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
    primary:
      "btn-brand shadow-[0_12px_28px_-12px_rgba(255,0,0,0.55)]",

    outline:
      "rounded-[5px] border border-transparent bg-solid-white text-[#0a0a0a] hover:bg-slate-100",

    ghost: "rounded-[5px] text-slate-700 hover:bg-slate-100",
    bg_firstBtn: "rounded-[5px]",
    bg_secondBtn: "rounded-[5px] bg-solid-white text-[#0a0a0a] hover:bg-slate-100",
  };

  const baseClasses =
    "inline-flex items-center justify-center rounded-[5px] px-6 py-3 text-sm font-medium transition duration-300";

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
