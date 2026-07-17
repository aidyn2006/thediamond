"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { resetPassword } from "./actions";

const schema = z
  .object({
    password: z.string().min(8, "Пароль от 8 символов"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Пароли не совпадают",
  });

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    const result = await resetPassword({ token, password });
    setLoading(false);
    if (!result.ok) {
      setFormError(result.message ?? "Не удалось сбросить пароль");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!token) {
    return (
      <div className="w-full max-w-[400px]">
        <h1 className="mb-1 text-22 font-semibold">Ссылка недействительна</h1>
        <p className="mb-6 text-15 text-text-dim">
          Похоже, ссылка неполная. Запросите сброс пароля заново.
        </p>
        <Link href="/forgot-password" className="text-15 text-accent">
          Запросить ссылку
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full max-w-[400px]">
        <h1 className="mb-1 text-22 font-semibold">Пароль обновлён</h1>
        <p className="mb-6 text-15 text-text-dim">
          Теперь можно войти с новым паролем. Перенаправляем на вход…
        </p>
        <Link href="/login" className="text-15 text-accent">
          Войти сейчас
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px]">
      <h1 className="mb-1 text-22 font-semibold">Новый пароль</h1>
      <p className="mb-6 text-15 text-text-dim">
        Придумайте новый пароль для входа.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Новый пароль"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="От 8 символов"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <Input
          label="Повторите пароль"
          name="confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />
        {formError && <p role="alert" className="text-13 text-error">{formError}</p>}
        <Button type="submit" variant="primary" fullWidth loading={loading}>
          Сохранить пароль
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-dvh flex-col items-center px-6 py-12">
      <Logo className="mb-10" />
      <Suspense>
        <ResetForm />
      </Suspense>
    </main>
  );
}
