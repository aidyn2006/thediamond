"use server";

import { BACKEND_URL } from "@/lib/api";

export interface ResetResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<ResetResult> {
  const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => null);
  return {
    ok: false,
    message: data?.message ?? "Не удалось сбросить пароль. Запросите ссылку заново",
    fieldErrors: data?.fieldErrors,
  };
}
