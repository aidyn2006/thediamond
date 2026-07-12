import { requireApprovedRole } from "@/lib/guards";
import { AppHeader } from "@/components/app/AppHeader";
import { CampaignForm } from "@/components/campaign/CampaignForm";
import { brandNav } from "@/lib/nav";

export default async function NewCampaignPage() {
  const me = await requireApprovedRole("BRAND");
  return (
    <>
      <AppHeader email={me.email} items={brandNav} />
      <CampaignForm />
    </>
  );
}
