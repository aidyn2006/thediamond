"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function sendEmailCode(): Promise<{ ok: boolean; message?: string }> {
  const res = await apiFetch("/api/auth/email/send-code", { method: "POST" });
  const data = res.ok ? null : await res.json().catch(() => null);
  return { ok: res.ok, message: data?.message };
}

export async function verifyEmail(code: string): Promise<{ ok: boolean; message?: string }> {
  const res = await apiFetch("/api/auth/email/verify", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  const data = res.ok ? null : await res.json().catch(() => null);
  if (res.ok) revalidatePath("/pending");
  return { ok: res.ok, message: data?.message };
}
