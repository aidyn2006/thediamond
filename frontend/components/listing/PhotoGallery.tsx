"use client";

import { useState } from "react";

/** Listing photos: one big frame plus thumbnails. Falls back to a placeholder. */
export function PhotoGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-card border border-border bg-surface text-13 text-text-dim">
        Без фото
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-card border border-border bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={`${alt} — фото ${active + 1}`}
          className="aspect-[4/3] w-full object-contain"
        />
      </div>
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Открыть фото ${i + 1}`}
              aria-current={i === active}
              className={`overflow-hidden rounded-btn border ${
                i === active ? "border-accent" : "border-border"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-16 w-16 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
