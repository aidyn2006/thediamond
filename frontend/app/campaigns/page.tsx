import { requireRole } from "@/lib/guards";
import { AppHeader } from "@/components/app/AppHeader";
import { StagePlaceholder } from "@/components/app/StagePlaceholder";

export default async function CampaignsPage() {
  const session = await requireRole("CREATOR");
  return (
    <>
      <AppHeader email={session.user.email} />
      <StagePlaceholder
        title="Лента кампаний"
        note="Здесь появится лента активных кампаний с поиском и фильтрами. Раздел собираем на этапе 4."
      />
    </>
  );
}
