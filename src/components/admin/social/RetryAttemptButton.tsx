"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RetryAttemptButton({ attemptId, label }: { attemptId: string; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch(`/api/admin/social/attempts/${attemptId}/retry`, { method: "POST" });
        setPending(false);
        router.refresh();
      }}
      className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
    >
      {pending ? "Retrying…" : `Retry ${label}`}
    </button>
  );
}
