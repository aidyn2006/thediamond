"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function approveListing(id: number) {
  const res = await apiFetch(`/api/admin/listings/${id}/approve`, { method: "POST" });
  revalidatePath("/admin");
  revalidatePath("/listings");
  const data = res.ok ? null : await res.json().catch(() => null);
  return { ok: res.ok, message: data?.message };
}

export async function rejectListing(id: number, reason: string) {
  const res = await apiFetch(`/api/admin/listings/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  revalidatePath("/admin");
  const data = res.ok ? null : await res.json().catch(() => null);
  return { ok: res.ok, message: data?.message };
}

export async function setUserBan(id: number, banned: boolean) {
  const res = await apiFetch(`/api/admin/users/${id}/${banned ? "ban" : "unban"}`, {
    method: "POST",
  });
  revalidatePath("/admin/users");
  const data = res.ok ? null : await res.json().catch(() => null);
  return { ok: res.ok, message: data?.message };
}
