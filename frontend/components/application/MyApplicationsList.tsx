"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatTenge } from "@/lib/categories";
import { applicationStatusPill } from "@/lib/status";
import { submitWork } from "@/app/campaigns/actions";
import type { MyApplication } from "@/lib/api-types";

function SubmitForm({ appId, cta }: { appId: number; cta: string }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function go() {
    setError(null);
    if (!/^https?:\/\/.+/.test(url.trim())) {
      setError("Вставьте ссылку (http…)");
      return;
    }
    setLoading(true);
    const res = await submitWork(appId, url.trim());
    setLoading(false);
    if (!res.ok) setError(res.message ?? "Не получилось");
    else router.refresh();
  }

  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input
          label="Ссылка на опубликованный контент"
          name={`url-${appId}`}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={error ?? undefined}
          placeholder="https://instagram.com/p/…"
        />
      </div>
      <Button variant="primary" onClick={go} loading={loading} type="button">
        {cta}
      </Button>
    </div>
  );
}

function Row({ app }: { app: MyApplication }) {
  const pill = applicationStatusPill[app.status];
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link href={`/campaigns/${app.campaign.id}`} className="text-17 font-semibold hover:text-accent">
            {app.campaign.title}
          </Link>
          <p className="tabular text-13 text-text-dim">
            {app.campaign.brandName} · {formatTenge(app.campaign.rewardPerCreator)}
          </p>
        </div>
        <StatusPill tone={pill.tone} label={pill.label} />
      </div>

      {app.status === "APPLIED" && (
        <p className="mt-2 text-13 text-text-dim">Ждём ответа бренда.</p>
      )}
      {app.status === "DECLINED" && (
        <p className="mt-2 text-13 text-text-dim">Бренд не выбрал вас в этот раз.</p>
      )}
      {app.status === "ACCEPTED" && <SubmitForm appId={app.id} cta="Сдать работу" />}
      {app.status === "SUBMITTED" && (
        <p className="mt-2 text-13 text-text-dim">
          Работа на проверке.{" "}
          {app.submissionUrl && (
            <a href={app.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-accent">
              открыть ссылку
            </a>
          )}
        </p>
      )}
      {app.status === "APPROVED" && (
        <p className="mt-2 text-13 text-success">Работа одобрена. Отличная работа!</p>
      )}
      {app.status === "REJECTED" && (
        <div className="mt-3">
          <div className="border-l-2 border-error pl-3">
            <p className="text-13 font-medium text-error">Работа отклонена</p>
            {app.rejectReason && <p className="text-13 text-text-dim">{app.rejectReason}</p>}
          </div>
          {!app.resubmitUsed ? (
            <SubmitForm appId={app.id} cta="Сдать заново" />
          ) : (
            <p className="mt-2 text-13 text-text-dim">Пересдача уже использована.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function MyApplicationsList({ apps }: { apps: MyApplication[] }) {
  if (apps.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface p-10 text-center">
        <p className="text-17 font-semibold">Пока нет откликов</p>
        <p className="mx-auto mt-2 max-w-[42ch] text-15 text-text-dim">
          Загляните в кампании и откликнитесь на подходящую — отклики появятся здесь.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/campaigns" className="text-accent">К кампаниям</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {apps.map((a) => (
        <Row key={a.id} app={a} />
      ))}
    </div>
  );
}
