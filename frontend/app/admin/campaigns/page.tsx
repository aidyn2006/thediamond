import { apiFetch } from "@/lib/api";
import { CampaignModerationTable } from "@/components/admin/CampaignModerationTable";
import type { CampaignFull } from "@/lib/api-types";

async function loadPending(): Promise<CampaignFull[]> {
  const res = await apiFetch("/api/admin/campaigns?status=pending");
  if (!res.ok) return [];
  return (await res.json()) as CampaignFull[];
}

export default async function AdminCampaignsPage() {
  const rows = await loadPending();
  return (
    <div>
      <h1 className="mb-6 text-28 font-semibold">Модерация кампаний ({rows.length})</h1>
      <CampaignModerationTable rows={rows} />
    </div>
  );
}
