import { cn } from "@/lib/cn";

/**
 * Pill used by every chip row (brands, cities, price bands). Kept out of the
 * components so server components can share it without pulling in a client module.
 */
export function chipClasses(active = false) {
  return cn(
    "inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-pill px-4",
    "text-13 font-semibold transition-colors duration-150 md:text-15",
    active ? "bg-text text-surface" : "bg-surface-2 text-text hover:bg-border",
  );
}
