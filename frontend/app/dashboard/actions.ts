"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export interface CampaignInput {
  title: string;
  description: string;
  platforms: string[];
  category: string;
  rewardPerCreator: number;
  creatorsNeeded: number;
  deadline: string;
  requirements: string;
}

export interface CampaignActionResult {
  ok: boolean;
  id?: number;
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

async function toResult(res: Response): Promise<CampaignActionResult> {
  if (res.ok) {
    const data = await res.json().catch(() => null);
    return { ok: true, id: data?.id };
  }
  const data = await res.json().catch(() => null);
  return {
    ok: false,
    code: data?.code,
    message: data?.message ?? "Не получилось сохранить кампанию",
    fieldErrors: data?.fieldErrors,
  };
}

export async function createCampaign(
  input: CampaignInput,
  submit: boolean,
): Promise<CampaignActionResult> {
  const res = await apiFetch(`/api/brand/campaigns?submit=${submit}`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  revalidatePath("/dashboard");
  return toResult(res);
}

export async function updateCampaign(
  id: number,
  input: CampaignInput,
): Promise<CampaignActionResult> {
  const res = await apiFetch(`/api/brand/campaigns/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  revalidatePath("/dashboard");
  return toResult(res);
}

export async function submitCampaign(id: number): Promise<CampaignActionResult> {
  const res = await apiFetch(`/api/brand/campaigns/${id}/submit`, { method: "POST" });
  revalidatePath("/dashboard");
  return toResult(res);
}

export async function closeCampaign(id: number): Promise<CampaignActionResult> {
  const res = await apiFetch(`/api/brand/campaigns/${id}/close`, { method: "POST" });
  revalidatePath("/dashboard");
  revalidatePath(`/campaigns/${id}/manage`);
  return toResult(res);
}
