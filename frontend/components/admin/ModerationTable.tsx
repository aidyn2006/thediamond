"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatNumber } from "@/lib/categories";
import { moderateCreator, moderateBrand } from "@/app/admin/actions";
import type {
  CreatorProfileResponse,
  BrandProfileResponse,
} from "@/lib/api-types";

function ApprovalActions({
  approved,
  onApprove,
  onReject,
  busy,
}: {
  approved: boolean;
  onApprove: () => void;
  onReject: () => void;
  busy: boolean;
}) {
  return (
    <div className="flex justify-end gap-2">
      {!approved && (
        <Button variant="secondary" onClick={onApprove} disabled={busy} className="h-9 px-3 text-13">
          Одобрить
        </Button>
      )}
      {approved && (
        <Button variant="destructive" onClick={onReject} disabled={busy} className="h-9 px-3 text-13">
          Отозвать
        </Button>
      )}
      {!approved && (
        <Button variant="ghost" onClick={onReject} disabled={busy} className="h-9 px-3 text-13">
          Отклонить
        </Button>
      )}
    </div>
  );
}

function ProofCell({ creator }: { creator: CreatorProfileResponse }) {
  const proof = creator.socialProof;
  if (!proof) return <span className="text-text-dim">Нет</span>;

  return (
    <div className="flex max-w-[240px] flex-col gap-1 text-13 text-text-dim">
      <div className="flex items-center gap-2">
        <span className="font-medium text-text">{proof.platform}</span>
        <StatusPill
          tone={proof.status === "REJECTED" ? "error" : proof.status === "PENDING" ? "warning" : "success"}
          label={proof.status === "PENDING" ? "На проверке" : proof.status === "REJECTED" ? "Отклонено" : "Одобрено"}
        />
      </div>
      <a href={proof.postUrl} target="_blank" rel="noreferrer" className="text-accent">
        Пост
      </a>
      {proof.screenshotUrl && (
        <a href={proof.screenshotUrl} target="_blank" rel="noreferrer" className="text-accent">
          Скриншот
        </a>
      )}
      <span className="tabular">{proof.verificationCode}</span>
    </div>
  );
}

export function CreatorModerationTable({ rows }: { rows: CreatorProfileResponse[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);

  function act(id: number, approve: boolean) {
    setBusyId(id);
    start(async () => {
      await moderateCreator(id, approve);
      router.refresh();
      setBusyId(null);
    });
  }

  if (rows.length === 0) {
    return <p className="py-8 text-15 text-text-dim">Пусто - новых профилей нет.</p>;
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border text-left text-13 uppercase tracking-[0.04em] text-text-dim">
          <th className="py-2 font-medium">Креатор</th>
          <th className="py-2 font-medium">Город</th>
          <th className="py-2 font-medium">Подписчики</th>
          <th className="py-2 font-medium">Подтверждение</th>
          <th className="py-2 font-medium">Статус</th>
          <th className="py-2" />
        </tr>
      </thead>
      <tbody>
        {rows.map((c) => (
          <tr key={c.id} className="border-b border-border">
            <td className="h-[52px] py-2">
              <div className="font-medium text-text">{c.name}</div>
              <div className="text-13 text-text-dim">@{c.username} · {c.email}</div>
            </td>
            <td className="py-2 text-15 text-text-dim">{c.city}</td>
            <td className="py-2 tabular text-15 text-text-dim">{formatNumber(c.totalFollowers)}</td>
            <td className="py-2">
              <ProofCell creator={c} />
            </td>
            <td className="py-2">
              <StatusPill tone={c.approved ? "success" : "warning"} label={c.approved ? "Одобрен" : "На модерации"} />
            </td>
            <td className="py-2">
              <ApprovalActions
                approved={c.approved}
                busy={pending && busyId === c.id}
                onApprove={() => act(c.id, true)}
                onReject={() => act(c.id, false)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function BrandModerationTable({ rows }: { rows: BrandProfileResponse[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);

  function act(id: number, approve: boolean) {
    setBusyId(id);
    start(async () => {
      await moderateBrand(id, approve);
      router.refresh();
      setBusyId(null);
    });
  }

  if (rows.length === 0) {
    return <p className="py-8 text-15 text-text-dim">Пусто - новых профилей нет.</p>;
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border text-left text-13 uppercase tracking-[0.04em] text-text-dim">
          <th className="py-2 font-medium">Компания</th>
          <th className="py-2 font-medium">БИН</th>
          <th className="py-2 font-medium">Контакт</th>
          <th className="py-2 font-medium">Статус</th>
          <th className="py-2" />
        </tr>
      </thead>
      <tbody>
        {rows.map((b) => (
          <tr key={b.id} className="border-b border-border">
            <td className="h-[52px] py-2">
              <div className="font-medium text-text">{b.companyName}</div>
              <div className="text-13 text-text-dim">{b.email}</div>
            </td>
            <td className="py-2 tabular text-15 text-text-dim">{b.bin}</td>
            <td className="py-2 text-15 text-text-dim">{b.contactName} · {b.phone}</td>
            <td className="py-2">
              <StatusPill tone={b.approved ? "success" : "warning"} label={b.approved ? "Одобрен" : "На модерации"} />
            </td>
            <td className="py-2">
              <ApprovalActions
                approved={b.approved}
                busy={pending && busyId === b.id}
                onApprove={() => act(b.id, true)}
                onReject={() => act(b.id, false)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
