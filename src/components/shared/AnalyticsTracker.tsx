"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Only fires when NEXT_PUBLIC_ENABLE_DB_ANALYTICS=true.
 * Keeps Neon asleep for normal browsing on the free tier.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const enabled =
    process.env.NEXT_PUBLIC_ENABLE_DB_ANALYTICS === "1" ||
    process.env.NEXT_PUBLIC_ENABLE_DB_ANALYTICS === "true";

  useEffect(() => {
    if (!enabled) return;
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    const controller = new AbortController();

    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
      }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      // ignore analytics failures
    });

    return () => controller.abort();
  }, [pathname, enabled]);

  return null;
}
