import { Suspense } from "react";
import { apiFetch } from "@/lib/api";
import { UsersTable } from "@/components/admin/UsersTable";
import type { AdminUser } from "@/lib/api-types";

async function load(qs: string): Promise<AdminUser[]> {
  const res = await apiFetch(`/api/admin/users${qs ? `?${qs}` : ""}`);
  if (!res.ok) return [];
  return (await res.json()) as AdminUser[];
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const qs = search ? `search=${encodeURIComponent(search)}` : "";
  const rows = await load(qs);
  return (
    <div>
      <h1 className="mb-6 text-28 font-semibold">Пользователи</h1>
      <Suspense>
        <UsersTable rows={rows} />
      </Suspense>
    </div>
  );
}
