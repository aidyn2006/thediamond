"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export interface SimpleResult {
  ok: boolean;
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export interface ListingInput {
  brand: string;
  model: string;
  storageGb: number;
  ramGb: number | null;
  color: string | null;
  condition: string;
  batteryHealth: number | null;
  price: number;
  city: string;
  description: string;
  images: string[];
}

async function toResult(res: Response): Promise<SimpleResult> {
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => null);
  return {
    ok: false,
    code: data?.code,
    message: data?.message ?? "Не получилось",
    fieldErrors: data?.fieldErrors ?? undefined,
  };
}

/** Revalidates every surface a listing change can show up on. */
function revalidateListings(id?: number) {
  revalidatePath("/listings");
  revalidatePath("/my-listings");
  if (id) revalidatePath(`/listings/${id}`);
}

export async function createListing(input: ListingInput): Promise<SimpleResult> {
  const res = await apiFetch("/api/listings", {
    method: "POST",
    body: JSON.stringify(input),
  });
  revalidateListings();
  return toResult(res);
}

export async function updateListing(id: number, input: ListingInput): Promise<SimpleResult> {
  const res = await apiFetch(`/api/listings/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  revalidateListings(id);
  return toResult(res);
}

export async function markSold(id: number): Promise<SimpleResult> {
  const res = await apiFetch(`/api/listings/${id}/sold`, { method: "POST" });
  revalidateListings(id);
  revalidatePath("/deals");
  return toResult(res);
}

export async function archiveListing(id: number): Promise<SimpleResult> {
  const res = await apiFetch(`/api/listings/${id}`, { method: "DELETE" });
  revalidateListings(id);
  return toResult(res);
}

export async function toggleFavorite(id: number, on: boolean): Promise<SimpleResult> {
  const res = await apiFetch(`/api/favorites/${id}`, { method: on ? "PUT" : "DELETE" });
  revalidatePath("/favorites");
  revalidatePath(`/listings/${id}`);
  return toResult(res);
}

/** Uploads one listing photo and returns its public URL. */
export async function uploadPhoto(form: FormData): Promise<{ ok: boolean; url?: string; message?: string }> {
  const res = await apiFetch("/api/uploads/photo", { method: "POST", body: form });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { ok: false, message: data?.message ?? "Не удалось загрузить фото" };
  }
  const data = (await res.json()) as { url: string };
  return { ok: true, url: data.url };
}
