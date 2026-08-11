"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { SimpleResult } from "@/app/listings/actions";

async function toResult(res: Response): Promise<SimpleResult> {
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => null);
  return { ok: false, code: data?.code, message: data?.message ?? "Не получилось" };
}

function revalidateDeals(listingId?: number) {
  revalidatePath("/deals");
  revalidatePath("/my-listings");
  if (listingId) revalidatePath(`/listings/${listingId}`);
}

/** Buyer asks to buy. `message` is optional — sellers mostly just want the contact. */
export async function requestDeal(
  listingId: number,
  message?: string,
): Promise<SimpleResult> {
  const res = await apiFetch("/api/deals", {
    method: "POST",
    body: JSON.stringify({ listingId, message: message?.trim() || null }),
  });
  revalidateDeals(listingId);
  return toResult(res);
}

export async function acceptDeal(id: number): Promise<SimpleResult> {
  const res = await apiFetch(`/api/deals/${id}/accept`, { method: "POST" });
  revalidateDeals();
  return toResult(res);
}

export async function declineDeal(id: number, reason?: string): Promise<SimpleResult> {
  const res = await apiFetch(`/api/deals/${id}/decline`, {
    method: "POST",
    body: JSON.stringify({ reason: reason?.trim() || null }),
  });
  revalidateDeals();
  return toResult(res);
}

/** Seller confirms the handover; this also marks the listing SOLD. */
export async function completeDeal(id: number): Promise<SimpleResult> {
  const res = await apiFetch(`/api/deals/${id}/complete`, { method: "POST" });
  revalidateDeals();
  revalidatePath("/listings");
  return toResult(res);
}

export async function cancelDeal(id: number): Promise<SimpleResult> {
  const res = await apiFetch(`/api/deals/${id}/cancel`, { method: "POST" });
  revalidateDeals();
  return toResult(res);
}
