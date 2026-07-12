"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  { href: "/admin/profiles", label: "Профили" },
  { href: "/admin/campaigns", label: "Кампании" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/stats", label: "Статистика" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-btn px-3 py-2 text-15 transition-colors duration-150",
              active
                ? "bg-surface-2 text-text"
                : "text-text-dim hover:bg-surface-2 hover:text-text",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
