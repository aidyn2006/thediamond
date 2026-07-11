"use server";

import { BACKEND_URL } from "@/lib/api";
import type { Role } from "@/lib/types";

export interface RegisterResult {
  ok: boolean;
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function registerUser(input: {
  email: string;
  password: string;
  role: Role;
}): Promise<RegisterResult> {
  const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => null);
  return {
    ok: false,
    code: data?.code,
    message: data?.message ?? "Не получилось зарегистрироваться. Попробуйте ещё раз",
    fieldErrors: data?.fieldErrors,
  };
}
