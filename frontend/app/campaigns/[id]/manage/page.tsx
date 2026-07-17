import { redirect } from "next/navigation";
import { requireApprovedRole } from "@/lib/guards";
import { apiFetch } from "@/lib/api";
import { AppHeader } from "@/components/app/AppHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { ManageClient } from "@/components/campaign/ManageClient";
import { brandNav } from "@/lib/nav";
import { campaignStatusPill, type CampaignStatus } from "@/lib/status";
import type { CampaignFull, BrandApplication } from "@/lib/api-types";

type Tab = "applications" | "works" | "done";

export default async function ManagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const me = await requireApprovedRole("BRAND");
  const { id } = await params;
  const { tab } = await searchParams;

  const campaignRes = await apiFetch(`/api/brand/campaigns/${id}`);
  if (!campaignRes.ok) redirect("/dashboard");
  const campaign = (await campaignRes.json()) as CampaignFull;

  const appsRes = await apiFetch(`/api/brand/campaigns/${id}/applications`);
  const applications = appsRes.ok ? ((await appsRes.json()) as BrandApplication[]) : [];

  const initialTab: Tab = tab === "works" ? "works" : tab === "done" ? "done" : "applications";
  const pill = campaignStatusPill[campaign.status as CampaignStatus];

  return (
    <>
      <AppHeader email={me.email} items={brandNav} />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1200px] px-6 py-8 md:px-10">
        <div className="mb-6 flex items-center gap-3">
          <h1 className="text-28 font-semibold">{campaign.title}</h1>
          <StatusPill tone={pill.tone} label={pill.label} />
        </div>
        <ManageClient campaign={campaign} applications={applications} initialTab={initialTab} />
      </main>
    </>
  );
}
