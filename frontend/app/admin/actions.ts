"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function moderateCreator(id: number, approve: boolean) {
  const res = await apiFetch(`/api/admin/creators/${id}/${approve ? "approve" : "reject"}`, {
    method: "POST",
  });
  revalidatePath("/admin/profiles");
  return { ok: res.ok };
}

export async function moderateBrand(id: number, approve: boolean) {
  const res = await apiFetch(`/api/admin/brands/${id}/${approve ? "approve" : "reject"}`, {
    method: "POST",
  });
  revalidatePath("/admin/profiles");
  return { ok: res.ok };
}

export async function approveCampaign(id: number) {
  const res = await apiFetch(`/api/admin/campaigns/${id}/approve`, { method: "POST" });
  revalidatePath("/admin/campaigns");
  return { ok: res.ok };
}

export async function rejectCampaign(id: number, reason: string) {
  const res = await apiFetch(`/api/admin/campaigns/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  revalidatePath("/admin/campaigns");
  const data = res.ok ? null : await res.json().catch(() => null);
  return { ok: res.ok, message: data?.message };
}
