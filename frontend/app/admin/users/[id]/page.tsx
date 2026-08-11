import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { StatusPill } from "@/components/ui/StatusPill";
import { ListingCard } from "@/components/listing/ListingCard";
import { formatTenge } from "@/lib/phones";
import type { AdminUserDetail } from "@/lib/api-types";

const roleLabel: Record<string, string> = {
  USER: "Участник",
  ADMIN: "Админ",
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
  const res = await apiFetch(`/api/admin/users/${id}`);
  if (!res.ok) notFound();
  const u = (await res.json()) as AdminUserDetail;

  const sold = u.listings.filter((l) => l.status === "SOLD");
  const active = u.listings.filter((l) => l.status === "ACTIVE");

  return (
    <div>
      <Link href="/admin/users" className="text-13 text-accent hover:brightness-110">
        ← К пользователям
      </Link>
      <h1 className="mt-2 mb-6 text-28 font-semibold">{u.email}</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-card border border-border bg-surface p-5">
          <p className="mb-3 text-15 font-semibold">Аккаунт</p>
          <Row label="Роль" value={roleLabel[u.role] ?? u.role} />
          <Row
            label="Статус"
            value={
              <StatusPill tone={u.banned ? "error" : "success"}>
                {u.banned ? "Заблокирован" : "Активен"}
              </StatusPill>
            }
          />
          <Row
            label="Почта"
            value={
              <StatusPill tone={u.emailVerified ? "success" : "warning"}>
                {u.emailVerified ? "Подтверждена" : "Не подтверждена"}
              </StatusPill>
            }
          />
          <Row
            label="Регистрация"
            value={new Date(u.createdAt).toLocaleDateString("ru-RU")}
          />
        </div>

        <div className="rounded-card border border-border bg-surface p-5">
          <p className="mb-3 text-15 font-semibold">Профиль</p>
          {u.profile ? (
            <>
              <Row label="Имя" value={u.profile.displayName} />
              <Row label="Телефон" value={u.profile.phone} />
              <Row label="Город" value={u.profile.city} />
              <Row label="О себе" value={u.profile.about ?? "—"} />
            </>
          ) : (
            <p className="text-13 text-text-dim">Профиль ещё не заполнен.</p>
          )}
        </div>

        <div className="rounded-card border border-border bg-surface p-5">
          <p className="mb-3 text-15 font-semibold">Объявления</p>
          <Row label="Всего" value={u.listings.length} />
          <Row label="Активных" value={active.length} />
          <Row label="Продано" value={sold.length} />
          <Row
            label="Сумма проданного"
            value={formatTenge(sold.reduce((acc, l) => acc + l.price, 0))}
          />
        </div>
      </div>

      {u.listings.length > 0 && (
        <section className="mt-8" aria-labelledby="user-listings">
          <h2 id="user-listings" className="mb-4 text-18 font-semibold">
            Все объявления
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {u.listings.map((l) => (
              <ListingCard key={l.id} listing={l} showStatus />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
