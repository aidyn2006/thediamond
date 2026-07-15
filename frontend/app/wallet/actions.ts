"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function requestWithdraw(
  amount: number,
  requisites: string,
): Promise<{ ok: boolean; message?: string }> {
  const res = await apiFetch("/api/wallet/withdraw", {
    method: "POST",
    body: JSON.stringify({ amount, requisites }),
  });
  const data = res.ok ? null : await res.json().catch(() => null);
  if (res.ok) revalidatePath("/wallet");
  return {
    ok: res.ok,
    message: data?.message ?? data?.fieldErrors?.amount ?? data?.fieldErrors?.requisites,
  };
}
