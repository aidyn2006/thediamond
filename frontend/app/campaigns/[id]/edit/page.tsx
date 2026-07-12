import { redirect } from "next/navigation";
import { requireApprovedRole } from "@/lib/guards";
import { apiFetch } from "@/lib/api";
import { AppHeader } from "@/components/app/AppHeader";
import { CampaignForm } from "@/components/campaign/CampaignForm";
import { brandNav } from "@/lib/nav";
import type { CampaignFull } from "@/lib/api-types";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireApprovedRole("BRAND");
  const { id } = await params;

  const res = await apiFetch(`/api/brand/campaigns/${id}`);
  if (!res.ok) redirect("/dashboard");
  const campaign = (await res.json()) as CampaignFull;

  if (campaign.status !== "DRAFT" && campaign.status !== "REJECTED") {
    redirect("/dashboard");
  }

  return (
    <>
      <AppHeader email={me.email} items={brandNav} />
      <CampaignForm initial={campaign} />
    </>
  );
}
