import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ListingModerationTable } from "@/components/admin/ListingModerationTable";
import type { ListingSummary } from "@/lib/api-types";

const TABS = [
  { key: "pending", label: "На проверке" },
  { key: "active", label: "Опубликованные" },
  { key: "rejected", label: "Отклонённые" },
  { key: "sold", label: "Проданные" },
] as const;

export default async function AdminModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "pending" } = await searchParams;
  const res = await apiFetch(`/api/admin/listings?status=${encodeURIComponent(status)}`);
  const rows: ListingSummary[] = res.ok ? await res.json() : [];

  return (
    <div>
      <h1 className="mb-4 text-22 font-semibold">Модерация объявлений</h1>

      <nav aria-label="Фильтр по статусу" className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin?status=${tab.key}`}
            aria-current={status === tab.key ? "page" : undefined}
            className={
              status === tab.key
                ? "rounded-btn border border-accent px-3 py-1.5 text-13 text-accent"
                : "rounded-btn border border-border px-3 py-1.5 text-13 text-text-dim hover:text-text"
            }
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <ListingModerationTable rows={rows} />
    </div>
  );
}
