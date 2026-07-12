"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";
import { formatNumber, categoryLabels } from "@/lib/categories";
import { applicationStatusPill } from "@/lib/status";
import {
  acceptApplication,
  declineApplication,
  approveWork,
  rejectWork,
  closeCampaignAction,
} from "@/app/campaigns/[id]/manage/actions";
import type { BrandApplication, CampaignFull } from "@/lib/api-types";

type Tab = "applications" | "works" | "done";

function CreatorCell({ app }: { app: BrandApplication }) {
  const c = app.creator;
  return (
    <div className="min-w-0">
      <Link href={`/creators/${c.id}`} target="_blank" className="font-medium text-text hover:text-accent">
        {c.name}
      </Link>
      <p className="text-13 text-text-dim">
        {c.city} · {formatNumber(c.totalFollowers)} подписчиков
      </p>
      <p className="text-13 text-text-dim">
        {c.categories.map((cat) => categoryLabels[cat]).join(", ")}
      </p>
    </div>
  );
}

export function ManageClient({
  campaign,
  applications,
  initialTab,
}: {
  campaign: CampaignFull;
  applications: BrandApplication[];
  initialTab: Tab;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  const applied = applications.filter((a) => a.status === "APPLIED");
  const works = applications.filter((a) => a.status === "ACCEPTED" || a.status === "SUBMITTED");
  const done = applications.filter((a) => ["APPROVED", "REJECTED", "DECLINED"].includes(a.status));

  function run(fn: () => Promise<unknown>, id: number) {
    setBusyId(id);
    start(async () => {
      await fn();
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
      const res = await rejectWork(campaign.id, id, reason.trim());
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

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "applications", label: "Отклики", count: applied.length },
    { key: "works", label: "Работы", count: works.length },
    { key: "done", label: "Завершённые", count: done.length },
  ];

  return (
    <>
      {campaign.status === "ACTIVE" && (
        <div className="mb-4 flex justify-end">
          <Button variant="ghost" onClick={() => setClosing(true)}>
            Закрыть кампанию
          </Button>
        </div>
      )}
      <div className="mb-6 flex gap-6 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "border-b-2 pb-2 text-15 transition-colors duration-150",
              tab === t.key ? "border-accent text-text" : "border-transparent text-text-dim hover:text-text",
            )}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {tab === "applications" && (
        applied.length === 0 ? (
          <p className="py-8 text-15 text-text-dim">Пока никто не откликнулся.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {applied.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-4 py-3">
                <CreatorCell app={a} />
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" className="h-9 px-3 text-13" disabled={pending && busyId === a.id}
                    onClick={() => run(() => acceptApplication(campaign.id, a.id), a.id)}>
                    Принять
                  </Button>
                  <Button variant="ghost" className="h-9 px-3 text-13" disabled={pending && busyId === a.id}
                    onClick={() => run(() => declineApplication(campaign.id, a.id), a.id)}>
                    Отклонить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "works" && (
        works.length === 0 ? (
          <p className="py-8 text-15 text-text-dim">Пока нет принятых креаторов и работ.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {works.map((a) => {
              return (
                <div key={a.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <CreatorCell app={a} />
                    {a.submissionUrl && (
                      <a href={a.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-13 text-accent">
                        открыть работу ↗
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {a.status === "ACCEPTED" ? (
                      <StatusPill tone="success" label="Ждём работу" />
                    ) : (
                      <>
                        <Button variant="secondary" className="h-9 px-3 text-13" disabled={pending && busyId === a.id}
                          onClick={() => run(() => approveWork(campaign.id, a.id), a.id)}>
                          Одобрить
                        </Button>
                        <Button variant="destructive" className="h-9 px-3 text-13" disabled={pending && busyId === a.id}
                          onClick={() => { setRejectId(a.id); setReason(""); setReasonError(null); }}>
                          Отклонить
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === "done" && (
        done.length === 0 ? (
          <p className="py-8 text-15 text-text-dim">Завершённых пока нет.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {done.map((a) => {
              const pill = applicationStatusPill[a.status];
              return (
                <div key={a.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <CreatorCell app={a} />
                    {a.submissionUrl && (
                      <a href={a.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-13 text-accent">
                        открыть работу ↗
                      </a>
                    )}
                  </div>
                  <StatusPill tone={pill.tone} label={pill.label} />
                </div>
              );
            })}
          </div>
        )
      )}

      <Modal open={rejectId !== null} onClose={() => setRejectId(null)} title="Отклонить работу">
        <Textarea label="Причина" name="reason" value={reason} onChange={(e) => setReason(e.target.value)} error={reasonError ?? undefined} placeholder="Что не так с работой" />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRejectId(null)}>Отмена</Button>
          <Button variant="destructive" onClick={confirmReject} loading={pending}>Отклонить</Button>
        </div>
      </Modal>

      <Modal open={closing} onClose={() => setClosing(false)} title="Закрыть кампанию?">
        <p className="text-15 text-text-dim">
          После закрытия креаторы больше не смогут откликаться. Это действие необратимо.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setClosing(false)}>Отмена</Button>
          <Button variant="destructive" loading={pending}
            onClick={() => start(async () => { await closeCampaignAction(campaign.id); setClosing(false); router.refresh(); })}>
            Закрыть кампанию
          </Button>
        </div>
      </Modal>
    </>
  );
}
