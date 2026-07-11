"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { z } from "zod";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { roleHome } from "@/lib/types";

const schema = z.object({
  email: z.string().min(1, "Укажите email"),
  password: z.string().min(1, "Введите пароль"),
});

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = schema.safeParse({ email, password });
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

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setFormError("Неверный email или пароль");
      setLoading(false);
      return;
    }
    const session = await getSession();
    router.push(session?.user?.role ? roleHome(session.user.role) : "/");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center px-6 py-12">
      <Logo className="mb-10" />
      <div className="w-full max-w-[400px]">
        <h1 className="mb-1 text-22 font-semibold">С возвращением</h1>
        <p className="mb-6 text-15 text-text-dim">
          Войдите, чтобы продолжить работу.
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
            error={errors.email}
          />
          <Input
            label="Пароль"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          {formError && <p className="text-13 text-error">{formError}</p>}

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Войти
          </Button>
        </form>

        <p className="mt-6 text-center text-15 text-text-dim">
          Ещё нет аккаунта?{" "}
          <Link href="/register" className="text-accent">
            Создать
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
