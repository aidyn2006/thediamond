"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/app/listings/actions";
import { cn } from "@/lib/cn";

/**
 * Heart in the corner of a catalog card. Sits outside the card's <a> (a button
 * inside a link would swallow the click), hence the absolute positioning.
 */
export function FavoriteHeart({
  listingId,
  initial = false,
}: {
  listingId: number;
  initial?: boolean;
}) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    start(async () => {
      const res = await toggleFavorite(listingId, next);
      if (!res.ok) setOn(!next);
      else router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={on}
      aria-label={on ? "Убрать из избранного" : "В избранное"}
      className={cn(
        "absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-pill",
        "bg-surface/90 shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition-colors duration-150",
        "hover:bg-surface disabled:opacity-60",
        on ? "text-error" : "text-text-dim",
      )}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.65 12 20 12 20Z"
          fill={on ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
