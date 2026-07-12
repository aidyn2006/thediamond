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

export async function acceptApplication(campaignId: number, appId: number): Promise<SimpleResult> {
  const res = await apiFetch(`/api/brand/applications/${appId}/accept`, { method: "POST" });
  revalidatePath(`/campaigns/${campaignId}/manage`);
  return toResult(res);
}

export async function declineApplication(campaignId: number, appId: number): Promise<SimpleResult> {
  const res = await apiFetch(`/api/brand/applications/${appId}/decline`, { method: "POST" });
  revalidatePath(`/campaigns/${campaignId}/manage`);
  return toResult(res);
}

export async function approveWork(campaignId: number, appId: number): Promise<SimpleResult> {
  const res = await apiFetch(`/api/brand/applications/${appId}/approve-work`, { method: "POST" });
  revalidatePath(`/campaigns/${campaignId}/manage`);
  return toResult(res);
}

export async function rejectWork(campaignId: number, appId: number, reason: string): Promise<SimpleResult> {
  const res = await apiFetch(`/api/brand/applications/${appId}/reject-work`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  revalidatePath(`/campaigns/${campaignId}/manage`);
  return toResult(res);
}

export async function closeCampaignAction(campaignId: number): Promise<SimpleResult> {
  const res = await apiFetch(`/api/brand/campaigns/${campaignId}/close`, { method: "POST" });
  revalidatePath(`/campaigns/${campaignId}/manage`);
  revalidatePath("/dashboard");
  return toResult(res);
}
