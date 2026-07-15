"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { Platform } from "@/lib/categories";
import type { SocialProofResponse } from "@/lib/api-types";

export interface SocialProofResult {
  ok: boolean;
  proof?: SocialProofResponse;
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function uploadSocialProofScreenshot(
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
  return { ok: false, message: data?.message ?? "Не получилось загрузить скриншот" };
}

export async function submitSocialProof(input: {
  platform: Exclude<Platform, "YOUTUBE">;
  postUrl: string;
  screenshotUrl?: string;
}): Promise<SocialProofResult> {
  const res = await apiFetch("/api/creator/social-proof", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => null);
  revalidatePath("/pending");
  if (res.ok) return { ok: true, proof: data as SocialProofResponse };
  return {
    ok: false,
    code: data?.code,
    message: data?.message ?? "Не получилось отправить подтверждение",
    fieldErrors: data?.fieldErrors,
  };
}
