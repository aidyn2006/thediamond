"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusPill } from "@/components/ui/StatusPill";
import { submitSocialProof } from "@/app/pending/actions";
import type { SocialProofResponse, SocialProofState } from "@/lib/api-types";

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

/** Ready-to-post text (Kazakh). The user's personal code is appended so we can verify the post. */
function buildPostText(code: string): string {
  return `Егер Threads-та онсыз да пост жазып жүрсең...

Неге сол үшін ақша алмасқа?

Бізде брендтер постқа тапсырыс береді.

Пост жариялайсың → тексеріледі → ақша картаңа түседі.

💰 2 000–20 000 ₸ әр тапсырма.

Постқа + қойып лайк басып кет)

Сайттың аты thediamond kz деп гуглға жаз

${code}`;
}

export function SocialProofForm({ state }: { state: SocialProofState }) {
  const router = useRouter();
  const [postUrl, setPostUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [proof, setProof] = useState(state.proof);
  const [pending, start] = useTransition();

  const postText = buildPostText(state.verificationCode);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(postText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Не удалось скопировать — выделите текст вручную");
    }
  }

  function submit() {
    setError(null);
    const url = postUrl.trim();
    if (!url) {
      setError("Вставьте ссылку на ваш пост в Threads");
      return;
    }
    start(async () => {
      const result = await submitSocialProof({ platform: "THREADS", postUrl: url });
      if (!result.ok) {
        setError(result.message ?? "Не получилось отправить ссылку");
        return;
      }
      setProof(result.proof ?? null);
      router.refresh();
    });
  }

  // Already submitted / rewarded — show status instead of the form.
  if (proof && proof.status !== "REJECTED") {
    return (
      <div className="w-full max-w-[520px] text-left">
        <div className="rounded-card border border-border bg-surface p-5 text-center">
          <StatusPill tone={proofTone(proof.status)} label={statusLabel[proof.status]} />
          <p className="mt-3 text-15">
            {proof.status === "PENDING"
              ? "Мы проверяем ваш пост. Награда 1000 ₸ придёт на кошелёк после одобрения."
              : "Готово! Награда зачислена на ваш кошелёк."}
          </p>
          <a
            href={proof.postUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block break-all text-13 text-accent"
          >
            {proof.postUrl}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[520px] text-left">
      {proof?.status === "REJECTED" && proof.rejectReason && (
        <p className="mb-4 rounded-card border-l-2 border-error bg-surface p-3 text-13 text-text-dim">
          Пост отклонён: {proof.rejectReason}. Опубликуйте заново и отправьте ссылку.
        </p>
      )}

      {/* Step 1 — copy the ready text */}
      <div className="rounded-card border border-border bg-surface p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-13 font-semibold text-text-dim">1. Скопируйте текст</p>
          <button
            type="button"
            onClick={copyText}
            className="rounded-btn bg-accent px-3 py-1.5 text-13 font-semibold text-bg hover:brightness-110"
          >
            {copied ? "Скопировано ✓" : "Копировать"}
          </button>
        </div>
        <pre className="whitespace-pre-wrap break-words font-sans text-13 leading-relaxed text-text">
          {postText}
        </pre>
      </div>

      {/* Step 2 — publish it */}
      <div className="mt-4 rounded-card border border-border bg-surface p-4">
        <p className="mb-2 text-13 font-semibold text-text-dim">2. Опубликуйте в Threads</p>
        <a
          href="https://www.threads.net/"
          target="_blank"
          rel="noreferrer"
          className="text-15 text-accent"
        >
          Открыть Threads →
        </a>
      </div>

      {/* Step 3 — paste the link */}
      <div className="mt-4 flex flex-col gap-3">
        <Input
          label="3. Вставьте ссылку на ваш пост"
          name="postUrl"
          placeholder="https://www.threads.net/@you/post/..."
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
        />
        {error && <p className="text-13 text-error">{error}</p>}
        <Button type="button" variant="primary" fullWidth loading={pending} onClick={submit}>
          Отправить и получить 1000 ₸
        </Button>
      </div>
    </div>
  );
}
