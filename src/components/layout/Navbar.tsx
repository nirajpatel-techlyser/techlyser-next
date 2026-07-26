"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";

import { navigation } from "@/data/navigation";

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  // Avoid SSR/client pathname mismatch on active link classes
  const [canHighlight, setCanHighlight] = useState(false);

  useEffect(() => {
    setCanHighlight(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-header-border bg-surface-dark shadow-[var(--header-shadow)]">
      <Container className="flex h-14 items-center justify-between sm:h-20">
        <Link
          href="/"
          className="relative z-10 flex shrink-0 items-center"
          aria-label="Techlyser Web Solutions home"
        >
          <Image
            src="/images/TEXHLYSER_white_Logo.png"
            alt="Techlyser Web Solutions"
            width={180}
            height={48}
            priority
            className="site-logo h-9 w-auto object-contain sm:h-10 md:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navigation.map((item) => {
            const isActive =
              canHighlight && isNavActive(pathname, item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative text-sm font-medium transition hover:text-primary ${
                  isActive ? "text-primary" : "text-[var(--nav-link)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/contact"
          className="btn-brand hidden items-center gap-2 rounded-[5px] px-6 py-3 font-medium transition duration-300 md:flex"
        >
          Start Project
          <ArrowRight size={18} />
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-heading md:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </Container>

      {isOpen && (
        <div className="border-t border-header-border bg-surface-dark md:hidden">
          <nav className="flex flex-col px-6 py-4">
            {navigation.map((item) => {
              const isActive =
                canHighlight && isNavActive(pathname, item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`py-3 text-base font-medium transition hover:text-primary ${
                    isActive
                      ? "text-primary"
                      : "text-[var(--nav-link)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="btn-brand mx-6 mb-6 flex items-center justify-center gap-2 rounded-[5px] px-6 py-3 font-medium transition"
          >
            Start Project
            <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </header>
  );
}
