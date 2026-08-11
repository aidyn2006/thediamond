"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusPill } from "@/components/ui/StatusPill";
import { approveListing, rejectListing } from "@/app/admin/actions";
import { listingStatusPill } from "@/lib/status";
import { brandLabels, conditionLabels, formatTenge, relativeDate } from "@/lib/phones";
import type { ListingSummary } from "@/lib/api-types";
import { listingPath } from "@/lib/listing-url";

/** Moderation queue. Rejecting requires a reason — the seller sees it verbatim. */
export function ListingModerationTable({ rows }: { rows: ListingSummary[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run(id: number, action: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null);
    setBusyId(id);
    start(async () => {
      const res = await action();
      setBusyId(null);
      if (!res.ok) setError(res.message ?? "Не получилось");
      else {
        setRejecting(null);
        setReason("");
        router.refresh();
      }
    });
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-card border border-border bg-surface p-6 text-13 text-text-dim">
        Очередь пуста — все объявления разобраны.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="text-13 text-error">
          {error}
        </p>
      )}

      {rows.map((l) => {
        const status = listingStatusPill[l.status];
        return (
          <div
            key={l.id}
            className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 sm:flex-row"
          >
            {l.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={l.coverUrl}
                alt={l.title}
                className="h-20 w-20 shrink-0 rounded-btn object-cover"
              />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <Link href={listingPath(l)} className="text-15 text-text hover:text-accent">
                  {l.title}
                </Link>
                <StatusPill tone={status.tone} label={status.label} />
              </div>
              <p className="mt-1 text-13 text-text-dim">
                {formatTenge(l.price)} · {brandLabels[l.brand]} ·{" "}
                {conditionLabels[l.condition]} · {l.city} · {relativeDate(l.createdAt)}
              </p>

              {rejecting === l.id ? (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                  <Input
                    label="Причина отказа"
                    name={`reason-${l.id}`}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Фото не соответствует описанию"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      loading={pending && busyId === l.id}
                      disabled={!reason.trim()}
                      onClick={() => run(l.id, () => rejectListing(l.id, reason.trim()))}
                    >
                      Отклонить
                    </Button>
                    <Button variant="ghost" onClick={() => setRejecting(null)}>
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {l.status !== "ACTIVE" && (
                    <Button
                      variant="primary"
                      loading={pending && busyId === l.id}
                      onClick={() => run(l.id, () => approveListing(l.id))}
                    >
                      Опубликовать
                    </Button>
                  )}
                  {l.status !== "REJECTED" && (
                    <Button variant="secondary" onClick={() => setRejecting(l.id)}>
                      Отклонить
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
