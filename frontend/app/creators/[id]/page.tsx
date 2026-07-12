import { notFound } from "next/navigation";
import { requireApprovedRole } from "@/lib/guards";
import { apiFetch } from "@/lib/api";
import { AppHeader } from "@/components/app/AppHeader";
import { Avatar } from "@/components/ui/Avatar";
import { brandNav } from "@/lib/nav";
import { formatNumber, categoryLabels, platformLabels } from "@/lib/categories";
import type { CreatorProfileResponse } from "@/lib/api-types";

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireApprovedRole("BRAND");
  const { id } = await params;
  const res = await apiFetch(`/api/creators/${id}`);
  if (!res.ok) notFound();
  const c = (await res.json()) as CreatorProfileResponse;

  return (
    <>
      <AppHeader email={me.email} items={brandNav} />
      <main className="mx-auto max-w-[800px] px-6 py-8 md:px-10">
        <div className="flex items-center gap-4">
          <Avatar name={c.name} src={c.avatarUrl} size={96} />
          <div>
            <h1 className="text-28 font-semibold">{c.name}</h1>
            <p className="text-15 text-text-dim">@{c.username} · {c.city}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {c.categories.map((cat) => (
                <span key={cat} className="rounded-pill border border-border px-2 py-0.5 text-13 text-text-dim">
                  {categoryLabels[cat]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {c.bio && <p className="mt-6 whitespace-pre-line text-15 text-text-dim">{c.bio}</p>}

        <section className="mt-8">
          <h2 className="mb-3 text-15 font-semibold">Соцсети</h2>
          <div className="flex flex-col divide-y divide-border">
            {c.socials.map((s) => (
              <div key={s.platform} className="flex items-center justify-between gap-4 py-3">
                <span className="text-15">{platformLabels[s.platform]}</span>
                <span className="tabular text-13 text-text-dim">
                  {formatNumber(s.followers)} подписчиков
                </span>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-13 text-accent">
                  открыть ↗
                </a>
              </div>
            ))}
          </div>
        </section>

        {c.telegramUrl ? (
          <section className="mt-8 rounded-card border border-border bg-surface p-4">
            <p className="text-13 text-text-dim">Контакт для связи</p>
            <a href={c.telegramUrl} target="_blank" rel="noopener noreferrer" className="text-15 text-accent">
              {c.telegramUrl}
            </a>
          </section>
        ) : (
          <p className="mt-8 text-13 text-text-dim">
            Telegram откроется после того, как вы примете отклик этого креатора.
          </p>
        )}
      </main>
    </>
  );
}
