"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-6 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
        Error
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-slate-600">
        Please try again. If the problem continues, contact us and we will help
        you right away.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="btn-brand rounded-[5px] px-7 py-3.5"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-[5px] border border-slate-200 px-7 py-3.5 font-medium text-slate-800"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
