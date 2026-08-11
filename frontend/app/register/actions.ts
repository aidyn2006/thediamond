"use server";

import { BACKEND_URL } from "@/lib/api";

export interface RegisterResult {
  ok: boolean;
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

/** No role picker: every account can both sell and buy. */
export async function registerUser(input: {
  email: string;
  password: string;
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
