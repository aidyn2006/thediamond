"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Listing photos: one big frame plus thumbnails. Falls back to a placeholder.
 *
 * The main frame is the listing page's LCP element, so it loads with `priority` while
 * the thumbnails stay lazy — they are 64px squares and never worth a round trip up front.
 */
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
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-border bg-surface">
        <Image
          src={images[active]}
          alt={`${alt} — фото ${active + 1}`}
          fill
          sizes="(min-width: 1024px) 640px, 100vw"
          priority
          className="object-contain"
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
              <Image
                src={url}
                alt=""
                width={64}
                height={64}
                sizes="64px"
                className="h-16 w-16 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
