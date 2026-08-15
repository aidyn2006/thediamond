"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { adminNav } from "@/lib/nav";

export function AdminNav() {
  const pathname = usePathname();
  return (
    // Admin screens get no mobile tab bar (AppHeader is rendered without nav items),
    // so on a phone this row IS the navigation: it scrolls sideways instead of
    // stacking four full-width buttons above every page.
    <nav
      aria-label="Навигация админки"
      className="-mx-6 flex gap-1 overflow-x-auto px-6 md:mx-0 md:flex-col md:overflow-visible md:px-0"
    >
      {adminNav.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-btn px-3 py-2 text-15 transition-colors duration-150",
              active ? "bg-surface text-text" : "text-text-dim hover:text-text",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
