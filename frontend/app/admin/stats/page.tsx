import { apiFetch } from "@/lib/api";
import { formatNumber } from "@/lib/phones";
import type { StatsResponse } from "@/lib/api-types";

async function getStats(): Promise<StatsResponse | null> {
  const res = await apiFetch("/api/admin/stats");
  if (!res.ok) return null;
  return (await res.json()) as StatsResponse;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="tabular font-display text-40 font-semibold">
        {formatNumber(value)}
      </div>
      <div className="mt-1 text-13 text-text-dim">{label}</div>
    </div>
  );
}

export default async function AdminStatsPage() {
  const stats = await getStats();
  if (!stats) {
    return <p className="text-15 text-text-dim">Не получилось загрузить. Обновить</p>;
  }
  return (
    <div>
      <h1 className="mb-6 text-28 font-semibold">Статистика</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Участников" value={stats.users} />
        <StatCard label="Активных объявлений" value={stats.activeListings} />
        <StatCard label="Ждут проверки" value={stats.pendingListings} />
        <StatCard label="Сделок за всё время" value={stats.deals} />
      </div>
    </div>
  );
}
