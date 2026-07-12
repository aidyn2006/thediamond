"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { NavItem } from "./AppHeader";

/** Bottom tab bar for mobile app navigation (design 2.7). Hidden on desktop. */
export function MobileTabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  if (items.length === 0) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid border-t border-border bg-surface md:hidden"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-14 items-center justify-center text-13 font-medium transition-colors duration-150",
              active ? "text-accent" : "text-text-dim",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
