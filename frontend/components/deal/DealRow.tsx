"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { dealStatusPill } from "@/lib/status";
import { formatTenge, relativeDate } from "@/lib/phones";
import {
  acceptDeal,
  cancelDeal,
  completeDeal,
  declineDeal,
} from "@/app/deals/actions";
import type { DealItem } from "@/lib/api-types";
import { listingPath } from "@/lib/listing-url";

/**
 * One deal, from either side. The seller drives the status; the buyer can only
 * cancel. Phone numbers appear once the deal is ACCEPTED.
 */
export function DealRow({ deal }: { deal: DealItem }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const status = dealStatusPill[deal.status];

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null);
    start(async () => {
      const res = await action();
      if (!res.ok) setError(res.message ?? "Не получилось");
      else router.refresh();
    });
  }

  const sellerActions = deal.iAmSeller && (
    <>
      {deal.status === "REQUESTED" && (
        <>
          <Button variant="primary" loading={pending} onClick={() => run(() => acceptDeal(deal.id))}>
            Принять
          </Button>
          <Button variant="ghost" loading={pending} onClick={() => run(() => declineDeal(deal.id))}>
            Отклонить
          </Button>
        </>
      )}
      {deal.status === "ACCEPTED" && (
        <Button variant="primary" loading={pending} onClick={() => run(() => completeDeal(deal.id))}>
          Телефон передан
        </Button>
      )}
    </>
  );

  const buyerActions =
    !deal.iAmSeller &&
    (deal.status === "REQUESTED" || deal.status === "ACCEPTED") && (
      <Button variant="ghost" loading={pending} onClick={() => run(() => cancelDeal(deal.id))}>
        Отменить заявку
      </Button>
    );

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 sm:flex-row sm:items-start">
      {deal.listing.coverUrl && (
        <Link href={listingPath(deal.listing)} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={deal.listing.coverUrl}
            alt={deal.listing.title}
            className="h-20 w-20 rounded-btn object-cover"
          />
        </Link>
      )}

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={listingPath(deal.listing)} className="text-15 text-text hover:text-accent">
            {deal.listing.title}
          </Link>
          <StatusPill tone={status.tone} label={status.label} />
        </div>

        <p className="mt-1 text-13 text-text-dim">
          {formatTenge(deal.listing.price)} · {deal.iAmSeller ? "покупатель" : "продавец"}:{" "}
          {deal.counterpartName} · {relativeDate(deal.createdAt)}
        </p>

        {deal.message && (
          <p className="mt-2 whitespace-pre-line text-13 text-text-dim">«{deal.message}»</p>
        )}

        {deal.counterpartPhone ? (
          <a
            href={`tel:${deal.counterpartPhone.replace(/[^+\d]/g, "")}`}
            className="mt-2 inline-block text-15 text-accent"
          >
            {deal.counterpartPhone}
          </a>
        ) : (
          deal.status === "REQUESTED" && (
            <p className="mt-2 text-13 text-text-dim">
              {deal.iAmSeller
                ? "Примите заявку, чтобы обменяться телефонами."
                : "Ждём, пока продавец примет заявку."}
            </p>
          )
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {sellerActions}
          {buyerActions}
        </div>

        {error && (
          <p role="alert" className="mt-2 text-13 text-error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
