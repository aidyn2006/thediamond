"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { formatTenge } from "@/lib/categories";
import { campaignStatusPill, type CampaignStatus } from "@/lib/status";
import { approveCampaign, rejectCampaign } from "@/app/admin/actions";
import type { CampaignFull } from "@/lib/api-types";

export function CampaignModerationTable({ rows }: { rows: CampaignFull[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  function approve(id: number) {
    setBusyId(id);
    start(async () => {
      await approveCampaign(id);
      router.refresh();
      setBusyId(null);
    });
  }

  function confirmReject() {
    if (!reason.trim()) {
      setReasonError("Укажите причину");
      return;
    }
    const id = rejectId!;
    setBusyId(id);
    start(async () => {
      const res = await rejectCampaign(id, reason.trim());
      if (!res.ok) setReasonError(res.message ?? "Не получилось");
      else {
        setRejectId(null);
        setReason("");
        setReasonError(null);
        router.refresh();
      }
      setBusyId(null);
    });
  }

  if (rows.length === 0) {
    return <p className="py-8 text-15 text-text-dim">Кампаний на модерации нет.</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {rows.map((c) => {
          const pill = campaignStatusPill[c.status as CampaignStatus];
          const isPending = c.status === "PENDING_REVIEW";
          return (
            <div key={c.id} className="rounded-card border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h2 className="text-17 font-semibold">{c.title}</h2>
                    <StatusPill tone={pill.tone} label={pill.label} />
                  </div>
                  <p className="mt-1 text-13 text-text-dim">
                    {c.brandName} · {formatTenge(c.rewardPerCreator)} × {c.creatorsNeeded} = {formatTenge(c.budget)}
                  </p>
                  <p className="mt-2 max-w-prose text-15 text-text-dim">{c.description}</p>
                  {c.rejectReason && (
                    <p className="mt-2 border-l-2 border-error pl-3 text-13 text-text-dim">
                      Причина отклонения: {c.rejectReason}
                    </p>
                  )}
                </div>
                {isPending && (
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" className="h-9 px-3 text-13" disabled={pending && busyId === c.id} onClick={() => approve(c.id)}>
                      Одобрить
                    </Button>
                    <Button variant="destructive" className="h-9 px-3 text-13" disabled={pending && busyId === c.id} onClick={() => { setRejectId(c.id); setReason(""); setReasonError(null); }}>
                      Отклонить
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={rejectId !== null} onClose={() => setRejectId(null)} title="Отклонить кампанию">
        <Textarea
          label="Причина"
          name="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={reasonError ?? undefined}
          placeholder="Что нужно исправить бренду"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRejectId(null)}>Отмена</Button>
          <Button variant="destructive" onClick={confirmReject} loading={pending}>
            Отклонить
          </Button>
        </div>
      </Modal>
    </>
  );
}
