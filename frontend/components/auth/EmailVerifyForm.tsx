"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { sendEmailCode, verifyEmail } from "@/app/verify-email/actions";

/**
 * Email confirmation flow: request a 6-digit code, enter it, get auto-approved.
 * On success we send the user to their role home.
 */
export function EmailVerifyForm({ email, home }: { email: string; home: string }) {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, startSend] = useTransition();
  const [verifying, startVerify] = useTransition();

  function send() {
    setError(null);
    setInfo(null);
    startSend(async () => {
      const res = await sendEmailCode();
      if (res.ok) {
        setSent(true);
        setInfo("Код отправлен на " + email + ". Проверьте почту.");
      } else {
        setError(res.message ?? "Не получилось отправить код");
      }
    });
  }

  function verify() {
    setError(null);
    if (code.trim().length !== 6) {
      setError("Код состоит из 6 цифр");
      return;
    }
    startVerify(async () => {
      const res = await verifyEmail(code.trim());
      if (res.ok) {
        router.push(home);
        router.refresh();
      } else {
        setError(res.message ?? "Неверный код");
      }
    });
  }

  return (
    <div className="w-full max-w-[420px] text-left">
      <div className="rounded-card border border-border bg-surface p-5">
        <p className="text-15 font-semibold text-text">Подтверждение почты</p>
        <p className="mt-1 text-13 text-text-dim">
          Подтвердите <span className="text-text">{email}</span> — после этого профиль откроется автоматически.
        </p>

        {!sent ? (
          <Button
            type="button"
            variant="primary"
            fullWidth
            loading={sending}
            className="mt-4"
            onClick={send}
          >
            Отправить код
          </Button>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <Input
              label="Код из письма"
              name="code"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
            <Button type="button" variant="primary" fullWidth loading={verifying} onClick={verify}>
              Подтвердить
            </Button>
            <button
              type="button"
              onClick={send}
              disabled={sending}
              className="text-13 text-accent hover:brightness-110 disabled:opacity-60"
            >
              Отправить код повторно
            </button>
          </div>
        )}

        {info && <p className="mt-3 text-13 text-success">{info}</p>}
        {error && <p className="mt-3 text-13 text-error">{error}</p>}
      </div>
    </div>
  );
}
