import { requireRole } from "@/lib/guards";
import { AppHeader } from "@/components/app/AppHeader";
import { StagePlaceholder } from "@/components/app/StagePlaceholder";

export default async function AdminPage() {
  const session = await requireRole("ADMIN");
  return (
    <>
      <AppHeader email={session.user.email} />
      <StagePlaceholder
        title="Админка"
        note="Модерация профилей и кампаний, пользователи и статистика. Раздел собираем на этапе 2."
      />
    </>
  );
}
