"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Sends a `page_view` on every route change.
 *
 * gtag.js only auto-reports the page it was loaded on; App Router navigations are
 * client-side, so without this every visit would look like a single-page session.
 * The init script sets `send_page_view: false`, which makes this the *only* source
 * of page views — including the first one — so nothing is double-counted.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    const qs = searchParams.toString();
    window.gtag("event", "page_view", {
      page_path: qs ? `${pathname}?${qs}` : pathname,
      page_location: window.location.href,
    });
  }, [pathname, searchParams]);

  return null;
}
