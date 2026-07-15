"use client";

import { ChevronDown } from "lucide-react";

import type { FaqItem } from "@/data/faq";

interface FaqCardProps {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}

export default function FaqCard({ item, isOpen, onToggle }: FaqCardProps) {
  const Icon = item.icon;

  return (
    <div
      className={`border-b border-slate-200 transition-colors duration-300 last:border-b-0 ${
        isOpen ? "bg-primary-soft" : "bg-white"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-4 px-5 py-6 text-left sm:gap-6 sm:px-8 sm:py-7"
      >
        <span
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300 ${
            isOpen
              ? "border-blue-600 bg-blue-50 text-blue-600"
              : "border-slate-200 text-slate-500"
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-slate-900 sm:text-lg">
            {item.question}
          </span>

          {isOpen && (
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              {item.answer}
            </p>
          )}
        </span>

        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
            isOpen
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </span>
      </button>
    </div>
  );
}
