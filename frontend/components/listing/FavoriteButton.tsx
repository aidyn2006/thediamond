"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/app/listings/actions";

export function FavoriteButton({
  listingId,
  initial,
}: {
  listingId: number;
  initial: boolean;
}) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();

  function toggle() {
    // Optimistic: the star flips immediately and reverts if the call fails.
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
      className="flex items-center gap-2 rounded-btn border border-border px-4 py-2 text-15 text-text-dim transition-colors duration-150 hover:border-accent hover:text-text disabled:opacity-60"
    >
      <span aria-hidden="true" className={on ? "text-accent" : ""}>
        {on ? "★" : "☆"}
      </span>
      {on ? "В избранном" : "В избранное"}
    </button>
  );
}
