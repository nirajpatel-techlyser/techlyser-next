"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";

import { navigation } from "@/data/navigation";

export default function Navbar() {
  // Variables
  const pathname = usePathname();

  // State
  const [isOpen, setIsOpen] = useState(false);

  // Functions
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-header-border bg-surface-dark shadow-[var(--header-shadow)]">
      <Container className="flex h-20 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="relative z-10 flex shrink-0 items-center"
          aria-label="Techlyser home"
        >
          <Image
            src="/images/TEXHLYSER_white_Logo.png"
            alt="Techlyser"
            width={180}
            height={48}
            priority
            className="h-9 w-auto object-contain sm:h-10 md:h-11"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="relative text-sm font-medium text-slate-300 transition hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link
          href="/contact"
          className="hidden items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition duration-300 hover:bg-primary-hover md:flex"
        >
          Start Project
          <ArrowRight size={18} />
        </Link>

        {/* Mobile Button (Coming Next) */}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white md:hidden"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </Container>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-white/10 bg-surface-dark md:hidden">
          <nav className="flex flex-col px-6 py-4">
            {navigation.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`py-3 text-base font-medium transition ${
                  pathname === item.href
                    ? "text-primary"
                    : "text-slate-300 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="mx-6 mb-6 flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary-hover"
          >
            Start Project
            <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </header>
  );
}
