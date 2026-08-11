import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app/AppHeader";
import { PublicHeader } from "@/components/public/PublicHeader";
import { ListingCard } from "@/components/listing/ListingCard";
import { JsonLd } from "@/components/JsonLd";
import { getPublicListings } from "@/lib/api";
import { memberNav } from "@/lib/nav";
import { breadcrumbJsonLd, catalogJsonLd, pageMetadata } from "@/lib/seo";
import { PHONE_BRANDS, brandBySlug, brandLabels, brandSlugs, formatTenge } from "@/lib/phones";

// Hubs are pure SEO landing pages — hourly is fresh enough and keeps them cached.
export const revalidate = 3600;

/** One static page per brand, so the whole hub set is prerendered at build time. */
export function generateStaticParams() {
  return PHONE_BRANDS.map((b) => ({ slug: brandSlugs[b] }));
}

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

        <div className="mt-6 flex flex-wrap gap-2">
          {PHONE_BRANDS.filter((b) => b !== brand).map((b) => (
            <Link
              key={b}
              href={`/listings/brand/${brandSlugs[b]}`}
              className="rounded-btn border border-border px-4 py-2 text-13 text-text-dim transition-colors duration-150 hover:border-accent hover:text-text"
            >
              {brandLabels[b]}
            </Link>
          ))}
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
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </main>

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
