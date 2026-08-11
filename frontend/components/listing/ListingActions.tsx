"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { archiveListing, markSold } from "@/app/listings/actions";
import type { ListingStatus } from "@/lib/status";

/** Row of seller actions under a card on /my-listings. */
export function ListingActions({
  listingId,
  status,
}: {
  listingId: number;
  status: ListingStatus;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const editable = status === "ACTIVE" || status === "REJECTED" || status === "DRAFT";
  const closable = status === "ACTIVE";
  const archivable = status !== "ARCHIVED" && status !== "SOLD";

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null);
    start(async () => {
      const res = await action();
      if (!res.ok) setError(res.message ?? "Не получилось");
      else router.refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {editable && (
          <Link href={`/listings/${listingId}/edit`}>
            <Button variant="secondary">Изменить</Button>
          </Link>
        )}
        {closable && (
          <Button
            variant="secondary"
            loading={pending}
            onClick={() => run(() => markSold(listingId))}
          >
            Продано
          </Button>
        )}
        {archivable && (
          <Button
            variant="ghost"
            loading={pending}
            onClick={() => run(() => archiveListing(listingId))}
          >
            В архив
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-13 text-error">
          {error}
        </p>
      )}
    </div>
  );
}
