"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { adminNav } from "@/lib/nav";

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Навигация админки" className="flex flex-col gap-1">
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
              "rounded-btn px-3 py-2 text-15 transition-colors duration-150",
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
