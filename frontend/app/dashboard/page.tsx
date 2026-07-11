import { requireRole } from "@/lib/guards";
import { AppHeader } from "@/components/app/AppHeader";
import { StagePlaceholder } from "@/components/app/StagePlaceholder";

export default async function DashboardPage() {
  const session = await requireRole("BRAND");
  return (
    <>
      <AppHeader email={session.user.email} />
      <StagePlaceholder
        title="Кабинет бренда"
        note="Здесь появятся ваши кампании со счётчиками откликов и кнопка «Создать кампанию». Раздел собираем на этапе 3."
      />
    </>
  );
}
