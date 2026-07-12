"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { roleHome, type Role } from "@/lib/types";
import { registerUser } from "./actions";

const schema = z.object({
  email: z.string().min(1, "Укажите email").email("Неверный формат email"),
  password: z.string().min(8, "Пароль от 8 символов"),
});

const ROLES: { value: Role; title: string; subtitle: string }[] = [
  { value: "CREATOR", title: "Креатор", subtitle: "Зарабатываю на контенте" },
  { value: "BRAND", title: "Бренд", subtitle: "Ищу креаторов" },
];

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = (params.get("role") as Role) ?? "CREATOR";

  const [role, setRole] = useState<Role>(
    initialRole === "BRAND" ? "BRAND" : "CREATOR",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<React.ReactNode>(null);
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

    const result = await registerUser({ email, password, role });
    if (!result.ok) {
      if (result.code === "EMAIL_TAKEN") {
        setFormError(
          <>
            Такой email уже зарегистрирован —{" "}
            <Link href="/login" className="text-accent underline">
              войти?
            </Link>
          </>,
        );
      } else if (result.fieldErrors) {
        setErrors(result.fieldErrors);
      } else {
        setFormError(result.message);
      }
      setLoading(false);
      return;
    }

    // auto sign-in after successful registration
    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (signInResult?.error) {
      router.push("/login");
      return;
    }
    router.push(roleHome(role));
  }

  return (
    <main className="flex min-h-dvh flex-col items-center px-6 py-12">
      <Logo className="mb-10" />
      <div className="w-full max-w-[400px]">
        <h1 className="mb-1 text-22 font-semibold">Создать аккаунт</h1>
        <p className="mb-6 text-15 text-text-dim">
          Выберите, зачем вы здесь — это нельзя будет поменять позже.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={cn(
                  "flex flex-col rounded-card border bg-surface p-4 text-left transition-colors duration-150",
                  role === r.value
                    ? "border-accent"
                    : "border-border hover:border-text-dim",
                )}
                aria-pressed={role === r.value}
              >
                <span className="text-15 font-semibold">{r.title}</span>
                <span className="text-13 text-text-dim">{r.subtitle}</span>
              </button>
            ))}
          </div>

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
            autoComplete="new-password"
            placeholder="От 8 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          {formError && <p className="text-13 text-error">{formError}</p>}

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Начать
          </Button>
        </form>

        <p className="mt-6 text-center text-15 text-text-dim">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-accent">
            Войти
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
