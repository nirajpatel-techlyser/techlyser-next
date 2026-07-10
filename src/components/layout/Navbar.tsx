"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-3xl font-bold tracking-tight">
          <span className="text-slate-900">Tech</span>
          <span className="text-blue-600">lyser</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="relative text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link
          href="/contact"
          className="hidden items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition duration-300 hover:bg-blue-700 md:flex"
        >
          Start Project
          <ArrowRight size={18} />
        </Link>

        {/* Mobile Button (Coming Next) */}

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </Container>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="flex flex-col px-6 py-4">
            {navigation.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`py-3 text-base font-medium transition ${
                  pathname === item.href
                    ? "text-blue-600"
                    : "text-slate-700 hover:text-blue-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="mx-6 mb-6 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Start Project
            <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </header>
  );
}
