"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { requestPasswordReset } from "./actions";

const schema = z.object({
  email: z.string().min(1, "Укажите email").email("Неверный формат email"),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Проверьте email");
      return;
    }
    setLoading(true);
    await requestPasswordReset(email);
    setLoading(false);
    setSent(true);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center px-6 py-12">
      <Logo className="mb-10" />
      <div className="w-full max-w-[400px]">
        {sent ? (
          <>
            <h1 className="mb-1 text-22 font-semibold">Проверьте почту</h1>
            <p className="mb-6 text-15 text-text-dim">
              Если аккаунт с адресом <span className="text-text">{email}</span>{" "}
              существует, мы отправили на него ссылку для сброса пароля. Ссылка
              действует 30 минут.
            </p>
            <Link href="/login" className="text-15 text-accent">
              Вернуться ко входу
            </Link>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-22 font-semibold">Забыли пароль?</h1>
            <p className="mb-6 text-15 text-text-dim">
              Укажите email — пришлём ссылку для восстановления доступа.
            </p>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.kz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error ?? undefined}
              />
              <Button type="submit" variant="primary" fullWidth loading={loading}>
                Отправить ссылку
              </Button>
            </form>
            <p className="mt-6 text-center text-15 text-text-dim">
              Вспомнили пароль?{" "}
              <Link href="/login" className="text-accent">
                Войти
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
