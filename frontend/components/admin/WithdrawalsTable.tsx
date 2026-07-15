"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { payWithdrawal, rejectWithdrawal } from "@/app/admin/actions";
import { formatTenge } from "@/lib/categories";
import type { WithdrawalItem, WithdrawalStatus } from "@/lib/api-types";

const wdStatus: Record<WithdrawalStatus, { label: string; tone: "success" | "warning" | "error" }> = {
  PENDING: { label: "В обработке", tone: "warning" },
  PAID: { label: "Выплачено", tone: "success" },
  REJECTED: { label: "Отклонено", tone: "error" },
};

export function WithdrawalsTable({ rows }: { rows: WithdrawalItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<WithdrawalItem | null>(null);
  const [reason, setReason] = useState("");

  function pay(w: WithdrawalItem) {
    setBusyId(w.id);
    start(async () => {
      await payWithdrawal(w.id);
      router.refresh();
      setBusyId(null);
    });
  }

  function confirmReject() {
    if (!rejecting) return;
    const id = rejecting.id;
    setBusyId(id);
    start(async () => {
      await rejectWithdrawal(id, reason.trim());
      router.refresh();
      setBusyId(null);
      setRejecting(null);
      setReason("");
    });
  }

  if (rows.length === 0) {
    return <p className="py-6 text-15 text-text-dim">Заявок на вывод пока нет.</p>;
  }

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-13 uppercase tracking-[0.04em] text-text-dim">
            <th className="py-2 font-medium">Сумма</th>
            <th className="py-2 font-medium">Реквизиты</th>
            <th className="py-2 font-medium">Статус</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((w) => (
            <tr key={w.id} className="border-b border-border">
              <td className="h-[52px] py-2 text-15 tabular">{formatTenge(w.amount)}</td>
              <td className="py-2 text-15">{w.requisites}</td>
              <td className="py-2">
                <StatusPill tone={wdStatus[w.status].tone} label={wdStatus[w.status].label} />
              </td>
              <td className="py-2 text-right">
                {w.status === "PENDING" && (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="primary"
                      className="h-9 px-3 text-13"
                      disabled={pending && busyId === w.id}
                      onClick={() => pay(w)}
                    >
                      Выплачено
                    </Button>
                    <Button
                      variant="destructive"
                      className="h-9 px-3 text-13"
                      disabled={pending && busyId === w.id}
                      onClick={() => setRejecting(w)}
                    >
                      Отклонить
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Отклонить заявку">
        <p className="mb-3 text-13 text-text-dim">
          Сумма вернётся на баланс пользователя. Причину увидит пользователь.
        </p>
        <Textarea
          label="Причина (необязательно)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRejecting(null)}>
            Отмена
          </Button>
          <Button variant="destructive" loading={pending} onClick={confirmReject}>
            Отклонить
          </Button>
        </div>
      </Modal>
    </>
  );
}
