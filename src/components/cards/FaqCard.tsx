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
      className={`keep-light border-b border-slate-200 transition-colors duration-300 last:border-b-0 ${
        isOpen ? "bg-primary-soft" : "bg-white"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-2.5 px-3.5 py-3.5 text-left sm:gap-5 sm:px-8 sm:py-6"
      >
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors duration-300 sm:h-10 sm:w-10 sm:rounded-lg ${
            isOpen
              ? "border-primary bg-primary-soft text-primary"
              : "border-slate-200 text-slate-500"
          }`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-snug text-slate-900 sm:text-lg">
            {item.question}
          </span>

          {isOpen && (
            <p className="mt-2 text-xs leading-5 text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
              {item.answer}
            </p>
          )}
        </span>

        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-300 sm:h-9 sm:w-9 ${
            isOpen ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-300 sm:h-4 sm:w-4 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </span>
      </button>
    </div>
  );
}
