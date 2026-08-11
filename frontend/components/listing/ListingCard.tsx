import Link from "next/link";
import { StatusPill } from "@/components/ui/StatusPill";
import { listingStatusPill } from "@/lib/status";
import {
  brandLabels,
  conditionLabels,
  formatTenge,
  relativeDate,
  storageLabel,
} from "@/lib/phones";
import type { ListingSummary } from "@/lib/api-types";

/**
 * Catalog / grid card. `showStatus` is for the seller's own screens — in the public
 * catalog every card is ACTIVE, so the pill would be noise.
 */
export function ListingCard({
  listing,
  showStatus = false,
}: {
  listing: ListingSummary;
  showStatus?: boolean;
}) {
  const status = listingStatusPill[listing.status];
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface transition-colors duration-150 hover:border-accent"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg">
        {listing.coverUrl ? (
          // Backend uploads are served from an arbitrary origin, so plain <img>
          // avoids configuring next/image remote patterns per deployment.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.coverUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-13 text-text-dim">
            без фото
          </div>
        )}
        {showStatus && (
          <div className="absolute left-3 top-3">
            <StatusPill tone={status.tone} label={status.label} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-18 font-semibold leading-tight">{formatTenge(listing.price)}</p>
        <p className="text-15 leading-tight text-text">
          {brandLabels[listing.brand]} {listing.model}
        </p>
        <p className="text-13 text-text-dim">
          {[
            listing.storageGb ? storageLabel(listing.storageGb) : null,
            conditionLabels[listing.condition],
            listing.batteryHealth ? `АКБ ${listing.batteryHealth}%` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="mt-auto text-13 text-text-dim">
          {listing.city} · {relativeDate(listing.createdAt)}
        </p>
      </div>
    </Link>
  );
}
