import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Logo } from "@/components/ui/Logo";
import { categoryLabels, platformLabels, formatNumber } from "@/lib/categories";
import type { PublicCreatorProfile } from "@/lib/api-types";

export default async function PublicCreatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await apiFetch(`/api/public/creators/${id}`);
  if (!res.ok) notFound();
  const p = (await res.json()) as PublicCreatorProfile;

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-[900px] items-center justify-between px-6">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/login" className="text-13 text-accent hover:brightness-110">
            Войти
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-6 py-10">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
          <div className="mb-4 h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border bg-surface-2 sm:mb-0">
            {p.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.avatarUrl} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-28 text-text-dim">
                {p.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-28 font-semibold">{p.name}</h1>
            <p className="text-15 text-text-dim">
              @{p.username} · {p.city}
            </p>
            <p className="mt-1 text-15">
              Аудитория: <span className="font-semibold">{formatNumber(p.totalFollowers)}</span>
            </p>
          </div>
        </div>

        {p.bio && <p className="mt-6 max-w-[60ch] text-15 text-text-dim">{p.bio}</p>}

        {p.categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {p.categories.map((c) => (
              <span
                key={c}
                className="rounded-pill border border-border bg-surface-2 px-3.5 py-2 text-13 font-medium text-text-dim"
              >
                {categoryLabels[c]}
              </span>
            ))}
          </div>
        )}

        {p.socials.length > 0 && (
          <div className="mt-6 flex flex-col gap-2">
            {p.socials.map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-15 text-accent hover:brightness-110"
              >
                {platformLabels[s.platform]}
                {s.followers != null && ` · ${formatNumber(s.followers)}`}
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
