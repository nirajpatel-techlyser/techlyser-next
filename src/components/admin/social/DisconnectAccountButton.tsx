"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DisconnectAccountButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        if (!confirm("Disconnect this social account?")) return;
        setPending(true);
        await fetch(`/api/admin/social/accounts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        setPending(false);
        router.refresh();
      }}
      className="text-sm font-semibold text-slate-700 hover:underline disabled:opacity-50"
    >
      {pending ? "Removing…" : "Disconnect"}
    </button>
  );
}
