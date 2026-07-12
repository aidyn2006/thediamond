import { requireApprovedRole } from "@/lib/guards";
import { AppHeader } from "@/components/app/AppHeader";
import { StagePlaceholder } from "@/components/app/StagePlaceholder";
import { creatorNav } from "@/lib/nav";

export default async function CampaignsPage() {
  const me = await requireApprovedRole("CREATOR");
  return (
    <>
      <AppHeader email={me.email} items={creatorNav} />
      <StagePlaceholder
        title="Лента кампаний"
        note="Здесь появится лента активных кампаний с поиском и фильтрами. Раздел собираем на этапе 4."
      />
    </>
  );
}
