"use client";

import { cn } from "@/lib/cn";

/** Multi-select chip (used for creator categories). */
export function Chip({
  selected,
  onToggle,
  children,
}: {
  selected: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "rounded-pill border px-3.5 py-2 text-13 font-medium transition-colors duration-150",
        selected
          ? "border-accent bg-accent/12 text-accent"
          : "border-border bg-surface-2 text-text-dim hover:border-text-dim",
      )}
    >
      {children}
    </button>
  );
}
