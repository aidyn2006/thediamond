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
import { CityChips } from "@/components/listing/CityChips";
import { JsonLd } from "@/components/JsonLd";
import { getPublicListings } from "@/lib/api";
import { memberNav } from "@/lib/nav";
import { breadcrumbJsonLd, catalogJsonLd, pageMetadata } from "@/lib/seo";
import {
  brandBySlug,
  brandLabels,
  brandQueryLabels,
  brandRuLabels,
  formatTenge,
  type PhoneBrand,
} from "@/lib/phones";

// Rendered per request (the header depends on the session), but the catalog fetch
// underneath is cached, so a hub costs one backend call per revalidate window.

// Titles use the query label ("iPhone"), not the display one ("Apple") — that's the
// word people type. The Cyrillic spelling goes into the description for the same reason.
function title(brand: PhoneBrand) {
  return `${brandQueryLabels[brand]} б/у — купить в Казахстане, цены`;
}

function description(brand: PhoneBrand) {
  const ru = brandRuLabels[brand];
  return `Объявления ${brandQueryLabels[brand]} б/у и новых в Казахстане${
    ru ? ` (${ru} бу)` : ""
  }: цены, память, состояние и ёмкость аккумулятора. Покупайте напрямую у владельца, без комиссии сайта.`;
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
    title: title(brand),
    description: description(brand),
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

        <h1 className="text-28 font-bold md:text-40">
          {brandQueryLabels[brand]} б/у в Казахстане
        </h1>
        <p className="mt-3 max-w-[680px] text-15 leading-relaxed text-text-dim">
          {listings.length > 0
            ? `${listings.length} объявлений${from != null ? `, от ${formatTenge(from)}` : ""}${
                brandRuLabels[brand] ? ` (в поиске — «${brandRuLabels[brand]} бу купить»)` : ""
              }. В каждой карточке память, состояние корпуса и ёмкость аккумулятора. Каждое объявление проверено модератором — платите продавцу при встрече, без комиссии сайта.`
            : `Сейчас нет активных объявлений ${label}. Загляните позже или посмотрите другие бренды.`}
        </p>

        <div className="mt-6">
          <BrandChips active={brand} />
        </div>

        {/* Brand × city links: the shape most local queries take. */}
        <div className="mt-3">
          <CityChips brandSlug={slug} allHref={`/listings/brand/${slug}`} />
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
            name: title(brand),
            description: description(brand),
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
