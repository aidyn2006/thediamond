"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export interface SimpleResult {
  ok: boolean;
  code?: string;
  message?: string;
}

async function toResult(res: Response): Promise<SimpleResult> {
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => null);
  return { ok: false, code: data?.code, message: data?.message ?? "Не получилось" };
}

export async function applyToCampaign(id: number): Promise<SimpleResult> {
  const res = await apiFetch(`/api/campaigns/${id}/apply`, { method: "POST" });
  revalidatePath(`/campaigns/${id}`);
  revalidatePath("/campaigns");
  revalidatePath("/my-applications");
  return toResult(res);
}

export async function submitWork(appId: number, submissionUrl: string): Promise<SimpleResult> {
  const res = await apiFetch(`/api/applications/${appId}/submit`, {
    method: "POST",
    body: JSON.stringify({ submissionUrl }),
  });
  revalidatePath("/my-applications");
  return toResult(res);
}
