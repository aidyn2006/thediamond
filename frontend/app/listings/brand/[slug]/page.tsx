import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app/AppHeader";
import { PublicHeader } from "@/components/public/PublicHeader";
import { CategoryBar } from "@/components/public/CategoryBar";
import { SiteFooter } from "@/components/public/SiteFooter";
import { ListingCard } from "@/components/listing/ListingCard";
import { BrandChips } from "@/components/listing/BrandChips";
import { JsonLd } from "@/components/JsonLd";
import { getPublicListings } from "@/lib/api";
import { memberNav } from "@/lib/nav";
import { breadcrumbJsonLd, catalogJsonLd, pageMetadata } from "@/lib/seo";
import { brandBySlug, brandLabels, formatTenge } from "@/lib/phones";

// Rendered per request (the header depends on the session), but the catalog fetch
// underneath is cached, so a hub costs one backend call per revalidate window.

function title(brand: string) {
  return `${brand} — купить телефон в Казахстане`;
}

function description(brand: string) {
  return `Объявления о продаже телефонов ${brand} в Казахстане: цены, состояние, память и город. Покупайте напрямую у частных продавцов без комиссии.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = brandBySlug[slug];
  if (!brand) return pageMetadata({ title: "Бренд не найден", index: false });
  return pageMetadata({
    title: title(brandLabels[brand]),
    description: description(brandLabels[brand]),
    path: `/listings/brand/${slug}`,
  });
}

export default async function BrandHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const { slug } = await params;
  const brand = brandBySlug[slug];
  if (!brand) notFound();

  const label = brandLabels[brand];
  const listings = await getPublicListings({ brand });
  // Cheapest offer is the one worth putting in the intro line.
  const from = listings.length
    ? Math.min(...listings.map((l) => l.price))
    : null;

  return (
    <>
      {session?.user ? (
        <AppHeader email={session.user.email} items={memberNav} />
      ) : (
        <PublicHeader />
      )}
      <CategoryBar signedIn={!!session?.user} />

      <main id="main-content" className="mx-auto max-w-[1200px] px-6 py-8 md:px-10">
        <nav aria-label="Хлебные крошки" className="mb-4 text-13 text-text-dim">
          <Link href="/listings" className="hover:text-text">
            Каталог
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-text">{label}</span>
        </nav>

        <h1 className="text-28 font-semibold md:text-40">{label}</h1>
        <p className="mt-2 max-w-[640px] text-15 text-text-dim">
          {listings.length > 0
            ? `${listings.length} объявлений${from != null ? `, от ${formatTenge(from)}` : ""}. Каждое проверено модератором — платите продавцу при встрече, без комиссии сайта.`
            : `Сейчас нет активных объявлений ${label}. Загляните позже или посмотрите другие бренды.`}
        </p>

        <div className="mt-6">
          <BrandChips active={brand} />
        </div>

        {listings.length === 0 ? (
          <div className="mt-8 rounded-card border border-border bg-surface p-8 text-center">
            <p className="text-15 text-text">Пока пусто</p>
            <Link
              href="/listings"
              className="mt-2 inline-block text-13 text-accent underline underline-offset-2"
            >
              Весь каталог
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} heart={!!session?.user} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />

      <JsonLd
        data={[
          catalogJsonLd({
            name: title(label),
            description: description(label),
            path: `/listings/brand/${slug}`,
            listings,
          }),
          breadcrumbJsonLd([
            { name: "Каталог", path: "/listings" },
            { name: label, path: `/listings/brand/${slug}` },
          ]),
        ]}
      />
    </>
  );
}
