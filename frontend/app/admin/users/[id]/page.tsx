import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { StatusPill } from "@/components/ui/StatusPill";
import { categoryLabels, platformLabels, formatNumber, formatTenge } from "@/lib/categories";
import type { AdminUserDetail, WithdrawalStatus } from "@/lib/api-types";

const roleLabel: Record<AdminUserDetail["role"], string> = {
  CREATOR: "Креатор",
  BRAND: "Бренд",
  ADMIN: "Админ",
};

const wdStatus: Record<WithdrawalStatus, { label: string; tone: "success" | "warning" | "error" }> = {
  PENDING: { label: "В обработке", tone: "warning" },
  PAID: { label: "Выплачено", tone: "success" },
  REJECTED: { label: "Отклонено", tone: "error" },
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
      <span className="text-13 text-text-dim">{label}</span>
      <span className="text-right text-15">{value}</span>
    </div>
  );
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await apiFetch(`/api/admin/users/${id}/detail`);
  if (!res.ok) notFound();
  const u = (await res.json()) as AdminUserDetail;

  return (
    <div>
      <Link href="/admin/users" className="text-13 text-accent hover:brightness-110">
        ← К пользователям
      </Link>
      <h1 className="mt-2 mb-6 text-28 font-semibold">{u.email}</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account */}
        <div className="rounded-card border border-border bg-surface p-5">
          <p className="mb-3 text-15 font-semibold">Аккаунт</p>
          <Row label="Роль" value={roleLabel[u.role]} />
          <Row
            label="Статус"
            value={
              <StatusPill tone={u.banned ? "error" : "success"} label={u.banned ? "Заблокирован" : "Активен"} />
            }
          />
          <Row
            label="Почта"
            value={
              <StatusPill
                tone={u.emailVerified ? "success" : "dim"}
                label={u.emailVerified ? "Подтверждена" : "Не подтверждена"}
              />
            }
          />
          <Row label="Регистрация" value={new Date(u.createdAt).toLocaleDateString("ru-RU")} />
          {u.role !== "ADMIN" && <Row label="Баланс кошелька" value={formatTenge(u.walletBalance)} />}
        </div>

        {/* Creator profile */}
        {u.creator && (
          <div className="rounded-card border border-border bg-surface p-5">
            <p className="mb-3 text-15 font-semibold">Профиль креатора</p>
            <Row label="Имя" value={u.creator.name} />
            <Row label="Username" value={`@${u.creator.username}`} />
            <Row label="Город" value={u.creator.city} />
            <Row label="Одобрен" value={u.creator.approved ? "Да" : "Нет"} />
            <Row
              label="Категории"
              value={u.creator.categories.map((c) => categoryLabels[c]).join(", ") || "—"}
            />
            <Row label="Аудитория" value={formatNumber(u.creator.totalFollowers)} />
            {u.creator.bio && (
              <p className="mt-3 text-13 text-text-dim">{u.creator.bio}</p>
            )}
            <div className="mt-3 flex flex-col gap-1">
              {u.creator.socials.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-13 text-accent hover:brightness-110"
                >
                  {platformLabels[s.platform]}: {formatNumber(s.followers ?? undefined)}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Brand profile */}
        {u.brand && (
          <div className="rounded-card border border-border bg-surface p-5">
            <p className="mb-3 text-15 font-semibold">Профиль бренда</p>
            <Row label="Компания" value={u.brand.companyName} />
            <Row label="БИН" value={u.brand.bin} />
            <Row label="Телефон" value={u.brand.phone} />
            <Row label="Контакт" value={u.brand.contactName} />
            <Row label="Одобрен" value={u.brand.approved ? "Да" : "Нет"} />
            {u.brand.website && (
              <a
                href={u.brand.website}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block text-13 text-accent hover:brightness-110"
              >
                {u.brand.website}
              </a>
            )}
          </div>
        )}

        {/* Withdrawals */}
        {u.withdrawals.length > 0 && (
          <div className="rounded-card border border-border bg-surface p-5 lg:col-span-2">
            <p className="mb-3 text-15 font-semibold">Заявки на вывод</p>
            <ul className="divide-y divide-border">
              {u.withdrawals.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-15">{formatTenge(w.amount)}</p>
                    <p className="truncate text-13 text-text-dim">{w.requisites}</p>
                  </div>
                  <StatusPill tone={wdStatus[w.status].tone} label={wdStatus[w.status].label} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
