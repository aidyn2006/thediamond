"use server";

import { apiFetch } from "@/lib/api";

export interface ActionResult {
  ok: boolean;
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

async function toResult(res: Response): Promise<ActionResult> {
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => null);
  return {
    ok: false,
    code: data?.code,
    message: data?.message ?? "Не получилось сохранить. Попробуйте ещё раз",
    fieldErrors: data?.fieldErrors,
  };
}

export interface CreatorProfileInput {
  name: string;
  username: string;
  city: string;
  birthDate: string;
  categories: string[];
  bio?: string;
  avatarUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  threadsUrl?: string;
  youtubeUrl?: string;
  telegramUrl?: string;
  instagramFollowers?: number | null;
  tiktokFollowers?: number | null;
  threadsFollowers?: number | null;
  youtubeFollowers?: number | null;
}

export async function saveCreatorProfile(
  input: CreatorProfileInput,
): Promise<ActionResult> {
  const res = await apiFetch("/api/creator/me", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return toResult(res);
}

export interface BrandProfileInput {
  companyName: string;
  bin: string;
  website?: string;
  phone: string;
  contactName: string;
}

export async function saveBrandProfile(
  input: BrandProfileInput,
): Promise<ActionResult> {
  const res = await apiFetch("/api/brand/me", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return toResult(res);
}

export async function uploadAvatar(
  formData: FormData,
): Promise<{ ok: boolean; url?: string; message?: string }> {
  const res = await apiFetch("/api/uploads/avatar", {
    method: "POST",
    body: formData,
  });
  if (res.ok) {
    const data = await res.json();
    return { ok: true, url: data.url };
  }
  const data = await res.json().catch(() => null);
  return { ok: false, message: data?.message ?? "Не удалось загрузить фото" };
}
