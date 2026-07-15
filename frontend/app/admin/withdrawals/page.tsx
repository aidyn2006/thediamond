import { apiFetch } from "@/lib/api";
import { WithdrawalsTable } from "@/components/admin/WithdrawalsTable";
import type { WithdrawalItem } from "@/lib/api-types";

async function load(): Promise<WithdrawalItem[]> {
  const res = await apiFetch("/api/admin/withdrawals");
  if (!res.ok) return [];
  return (await res.json()) as WithdrawalItem[];
}

export default async function AdminWithdrawalsPage() {
  const rows = await load();
  return (
    <div>
      <h1 className="mb-6 text-28 font-semibold">Заявки на вывод</h1>
      <WithdrawalsTable rows={rows} />
    </div>
  );
}
