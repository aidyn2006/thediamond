import Link from "next/link";
import Image from "next/image";
import { StatusPill } from "@/components/ui/StatusPill";
import { FavoriteHeart } from "./FavoriteHeart";
import { listingPath } from "@/lib/listing-url";
import { listingStatusPill } from "@/lib/status";
import {
  brandLabels,
  conditionLabels,
  formatTenge,
  storageLabel,
} from "@/lib/phones";
import { ui } from "@/lib/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/lib/routes";
import type { ListingSummary } from "@/lib/api-types";

/**
 * Catalog card. Reading order is the marketplace one: photo → model → city → price
 * last and loudest.
 *
 * `showStatus` is for the seller's own screens (in the public catalog every card is
 * ACTIVE, so the pill would be noise); `heart` is only passed on signed-in screens,
 * where favouriting actually works.
 *
 * `priority` marks the cards above the fold: on a catalog page the LCP element is one of
 * the first photos, and lazy-loading it costs a full round trip before anything paints.
 */
export function ListingCard({
  listing,
  showStatus = false,
  heart = false,
  favorite = false,
  priority = false,
  locale = DEFAULT_LOCALE,
}: {
  listing: ListingSummary;
  showStatus?: boolean;
  heart?: boolean;
  favorite?: boolean;
  priority?: boolean;
  locale?: Locale;
}) {
  const t = ui(locale);
  const status = listingStatusPill[listing.status];
  const specs = [
    listing.storageGb ? storageLabel(listing.storageGb) : null,
    conditionLabels[listing.condition],
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="relative h-full">
      {heart && <FavoriteHeart listingId={listing.id} initial={favorite} />}

      <Link
        href={listingPath(listing)}
        className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface transition-colors duration-150 hover:border-accent"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg">
          {listing.coverUrl ? (
            // `sizes` mirrors the grid below (2 → 3 → 4 → 6 columns); without it the
            // browser assumes 100vw and downloads a desktop-sized photo onto a phone.
            <Image
              src={listing.coverUrl}
              alt={listing.title}
              fill
              sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              priority={priority}
              className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-13 text-text-dim">
              {t.card.noPhoto}
            </div>
          )}

          {listing.batteryHealth != null && (
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-pill bg-success/90 px-2 py-0.5 text-13 font-semibold text-surface tabular">
              <svg viewBox="0 0 24 14" width="16" height="10" aria-hidden="true">
                <rect
                  x="1"
                  y="1"
                  width="19"
                  height="12"
                  rx="3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <rect x="3.5" y="3.5" width="14" height="7" rx="1.5" fill="currentColor" />
                <rect x="21" y="4.5" width="2.5" height="5" rx="1" fill="currentColor" />
              </svg>
              {listing.batteryHealth}%
            </span>
          )}
          {showStatus && (
            <div className="absolute bottom-2 left-2">
              <StatusPill tone={status.tone} label={status.label} />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3">
          <p className="line-clamp-2 min-h-10 text-15 leading-tight text-text group-hover:text-accent">
            {brandLabels[listing.brand]} {listing.model}
          </p>
          <span className="w-fit rounded-pill bg-surface-2 px-2 py-0.5 text-13 text-text-dim">
            {listing.city}
          </span>
          <p className="text-13 text-text-dim">{specs}</p>
          {/* Two columns on a phone leave ~124px of text: a seven-figure price only
              fits once the display size steps down. */}
          <p className="mt-auto whitespace-nowrap pt-1 text-17 font-bold leading-none tabular sm:text-22">
            {formatTenge(listing.price)}
          </p>
        </div>
      </Link>
    </div>
  );
}
