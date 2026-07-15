"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { setUserBan } from "@/app/admin/actions";
import type { AdminUser } from "@/lib/api-types";

const roleLabel: Record<AdminUser["role"], string> = {
  CREATOR: "Креатор",
  BRAND: "Бренд",
  ADMIN: "Админ",
};

export function UsersTable({ rows }: { rows: AdminUser[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);
    router.push(`/admin/users?${sp.toString()}`);
  }

  function toggle(u: AdminUser) {
    setBusyId(u.id);
    start(async () => {
      await setUserBan(u.id, !u.banned);
      router.refresh();
      setBusyId(null);
    });
  }

  return (
    <div>
      <form onSubmit={submitSearch} className="mb-6 max-w-sm">
        <Input label="Поиск по email" name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="creator.kz" />
      </form>

      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-13 uppercase tracking-[0.04em] text-text-dim">
            <th className="py-2 font-medium">Email</th>
            <th className="py-2 font-medium">Роль</th>
            <th className="py-2 font-medium">Статус</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-b border-border">
              <td className="h-[52px] py-2 text-15">
                <Link href={`/admin/users/${u.id}`} className="text-accent hover:brightness-110">
                  {u.email}
                </Link>
              </td>
              <td className="py-2 text-15 text-text-dim">{roleLabel[u.role]}</td>
              <td className="py-2">
                <StatusPill tone={u.banned ? "error" : "success"} label={u.banned ? "Заблокирован" : "Активен"} />
              </td>
              <td className="py-2 text-right">
                {u.role !== "ADMIN" && (
                  <Button
                    variant={u.banned ? "secondary" : "destructive"}
                    className="h-9 px-3 text-13"
                    disabled={pending && busyId === u.id}
                    onClick={() => toggle(u)}
                  >
                    {u.banned ? "Разблокировать" : "Заблокировать"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
