import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicCreator } from "@/lib/api";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata, profilePageJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { PublicHeader } from "@/components/public/PublicHeader";
import { categoryLabels, platformLabels, formatNumber } from "@/lib/categories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await getPublicCreator(id);
  if (!p) {
    return { title: "Профиль не найден", robots: { index: false, follow: false } };
  }

  const cats = p.categories.map((c) => categoryLabels[c]);
  const title = `${p.name} — креатор${p.city ? ` в ${p.city}` : ""}`;
  const description = p.bio?.trim()
    ? p.bio.trim()
    : `${p.name} — креатор${p.city ? ` из ${p.city}` : ""}. ${
        cats.length ? `${cats.join(", ")}. ` : ""
      }Аудитория ${formatNumber(p.totalFollowers)}. Профиль на TheDiamond.`;

  return pageMetadata({
    title,
    description,
    path: `/u/${p.id}`,
    ogType: "profile",
  });
}

export default async function PublicCreatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getPublicCreator(id);
  if (!p) notFound();

  return (
    <div className="min-h-dvh">
      <JsonLd
        data={[
          profilePageJsonLd(p),
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Каталог", path: "/catalog" },
            { name: p.name, path: `/u/${p.id}` },
          ]),
        ]}
      />

      <PublicHeader maxWidth="900px" />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-[900px] px-6 py-10">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
          <div className="mb-4 h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border bg-surface-2 sm:mb-0">
            {p.avatarUrl ? (
              // Above-the-fold LCP image — eager + high priority, explicit size to avoid CLS.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.avatarUrl}
                alt={p.name}
                width={96}
                height={96}
                loading="eager"
                fetchPriority="high"
                className="h-full w-full object-cover"
              />
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
