"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { NavItem } from "./AppHeader";

/**
 * Floating bottom bar for mobile (design 2.7): a dark pill over the content, icons
 * only for the known member routes. Anything else (the admin nav) keeps its label,
 * so this stays usable for navs we don't have icons for.
 */
const ICONS: Record<string, React.ReactNode> = {
  "/listings": (
    <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
  ),
  "/my-listings": (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </>
  ),
  "/favorites": (
    <path d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.65 12 20 12 20Z" />
  ),
  "/deals": (
    <>
      <path d="M4 8h16l-1.2 11a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  "/profile": (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" />
    </>
  ),
};

export function MobileTabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Мобильная навигация"
      // globals.css keys the body's bottom padding off this attribute, so the bar
      // reserves its own space instead of every page paying for it.
      data-mobile-tabbar=""
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex items-center justify-around rounded-pill bg-text px-2 py-2 shadow-[0_6px_24px_rgba(0,0,0,0.28)] md:hidden"
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const icon = ICONS[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
            className={cn(
              "flex h-11 flex-1 items-center justify-center rounded-pill transition-colors duration-150",
              active ? "text-mint" : "text-surface/60",
              !icon && "text-13 font-medium",
            )}
          >
            {icon ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {icon}
              </svg>
            ) : (
              item.label
            )}
          </Link>
        );
      })}
    </nav>
  );
}
