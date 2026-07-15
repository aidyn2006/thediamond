"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  submitSocialProof,
  uploadSocialProofScreenshot,
} from "@/app/pending/actions";
import type { Platform } from "@/lib/categories";
import type { SocialProofResponse, SocialProofState } from "@/lib/api-types";

const PROOF_PLATFORMS: Exclude<Platform, "YOUTUBE">[] = [
  "INSTAGRAM",
  "TIKTOK",
  "THREADS",
];

const statusLabel: Record<SocialProofResponse["status"], string> = {
  PENDING: "На проверке",
  AUTO_APPROVED: "Одобрено",
  APPROVED: "Одобрено",
  REJECTED: "Отклонено",
};

function proofTone(status: SocialProofResponse["status"]) {
  if (status === "REJECTED") return "error" as const;
  if (status === "PENDING") return "warning" as const;
  return "success" as const;
}

export function SocialProofForm({ state }: { state: SocialProofState }) {
  const router = useRouter();
  const [platform, setPlatform] = useState<Exclude<Platform, "YOUTUBE">>("INSTAGRAM");
  const [postUrl, setPostUrl] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proof, setProof] = useState(state.proof);
  const [pending, start] = useTransition();

  async function onScreenshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadSocialProofScreenshot(fd);
    setUploading(false);
    if (result.ok) setScreenshotUrl(result.url);
    else setError(result.message ?? "Не получилось загрузить скриншот");
  }

  function submit() {
    setError(null);
    if (!postUrl.trim()) {
      setError("Добавьте ссылку на публикацию");
      return;
    }
    if (!screenshotUrl) {
      setError("Загрузите скриншот публикации с кодом");
      return;
    }
    start(async () => {
      const result = await submitSocialProof({
        platform,
        postUrl: postUrl.trim(),
        screenshotUrl,
      });
      if (!result.ok) {
        setError(result.message ?? "Не получилось отправить подтверждение");
        return;
      }
      setProof(result.proof ?? null);
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-[520px] text-left">
      <div className="mb-6 rounded-card border border-border bg-surface p-4">
        <p className="text-13 text-text-dim">Ваш код для публикации</p>
        <p className="mt-1 font-display text-28 font-semibold tabular">{state.verificationCode}</p>
        <p className="mt-3 text-15 text-text-dim">
          Добавьте этот код в текст поста, видео или треда о TheDiamond. Потом вставьте ссылку и загрузите скриншот, где виден код.
        </p>
      </div>

      {proof && (
        <div className="mb-6 rounded-card border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-semibold">Последнее подтверждение</p>
            <StatusPill tone={proofTone(proof.status)} label={statusLabel[proof.status]} />
          </div>
          <a href={proof.postUrl} target="_blank" rel="noreferrer" className="break-all text-13 text-accent">
            {proof.postUrl}
          </a>
          {proof.rejectReason && (
            <p className="mt-3 border-l-2 border-error pl-3 text-13 text-text-dim">
              {proof.rejectReason}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <Select
          label="Площадка"
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Exclude<Platform, "YOUTUBE">)}
        >
          {PROOF_PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p === "INSTAGRAM" ? "Instagram" : p === "TIKTOK" ? "TikTok" : "Threads"}
            </option>
          ))}
        </Select>

        <Input
          label="Ссылка на публикацию"
          name="postUrl"
          placeholder="https://instagram.com/p/..."
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
        />

        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-13 font-medium text-text-dim">Скриншот публикации</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex h-11 cursor-pointer items-center rounded-btn border border-border bg-surface-2 px-4 text-15 font-semibold text-text hover:border-accent">
              {uploading ? "Загружаем..." : screenshotUrl ? "Заменить скриншот" : "Загрузить скриншот"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onScreenshotChange}
                disabled={uploading}
              />
            </label>
            {screenshotUrl && <span className="text-13 text-success">Скриншот загружен</span>}
          </div>
        </div>

        {error && <p className="text-13 text-error">{error}</p>}

        <Button type="button" variant="primary" fullWidth loading={pending} onClick={submit}>
          Отправить подтверждение
        </Button>
      </div>
    </div>
  );
}
