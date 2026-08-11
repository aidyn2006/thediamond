import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app/AppHeader";
import { PublicHeader } from "@/components/public/PublicHeader";
import { CategoryBar } from "@/components/public/CategoryBar";
import { SiteFooter } from "@/components/public/SiteFooter";
import { ListingCard } from "@/components/listing/ListingCard";
import { CityChips } from "@/components/listing/CityChips";
import { FaqBlock } from "@/components/seo/FaqBlock";
import { JsonLd } from "@/components/JsonLd";
import { getPublicListings } from "@/lib/api";
import { memberNav } from "@/lib/nav";
import {
  breadcrumbJsonLd,
  catalogJsonLd,
  faqPageJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { brandCityPath, cityBySlug, cityPath, type CityInfo } from "@/lib/geo";
import { brandBySlug, brandLabels, formatTenge, type PhoneBrand } from "@/lib/phones";
import { groupByModel, modelRuAlias } from "@/lib/models";

/**
 * Brand × city — the shape most Kazakh queries actually take ("iphone бу цена Астана").
 * Combinations with nothing to show are noindex (but still crawlable), so we never
 * publish 200+ empty pages just because the grid is possible.
 */

function title(brand: PhoneBrand, city: CityInfo) {
  return `${brandLabels[brand]} б/у ${city.in} — купить, цены`;
}

function description(brand: PhoneBrand, city: CityInfo, count: number, from: number | null) {
  const label = brandLabels[brand];
  return count > 0
    ? `${count} объявлений ${label} б/у ${city.in}${from != null ? ` от ${formatTenge(from)}` : ""}: память, состояние, ёмкость аккумулятора. Покупка напрямую у владельца, без комиссии.`
    : `Объявления ${label} б/у ${city.in}: цены, состояние и память. Покупка напрямую у владельца, без комиссии сайта.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}): Promise<Metadata> {
  const { slug, city: citySlug } = await params;
  const brand = brandBySlug[slug];
  const city = cityBySlug[citySlug];
  if (!brand || !city) return pageMetadata({ title: "Страница не найдена", index: false });

  const listings = await getPublicListings({ brand, city: city.name });
  const from = listings.length ? Math.min(...listings.map((l) => l.price)) : null;
  return pageMetadata({
    title: title(brand, city),
    description: description(brand, city, listings.length, from),
    path: brandCityPath(slug, city),
    index: listings.length > 0,
  });
}

export default async function BrandCityPage({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}) {
  const session = await auth();
  const { slug, city: citySlug } = await params;
  const brand = brandBySlug[slug];
  const city = cityBySlug[citySlug];
  if (!brand || !city) notFound();

  const label = brandLabels[brand];
  const listings = await getPublicListings({ brand, city: city.name });
  const from = listings.length ? Math.min(...listings.map((l) => l.price)) : null;
  const models = groupByModel(listings).slice(0, 8);
  const alias = modelRuAlias(brand, label);

  const qa = [
    {
      q: `Сколько стоит ${label} б/у ${city.in}?`,
      a:
        from != null
          ? `Сейчас ${city.in} есть предложения от ${formatTenge(from)}. Разброс объясняется памятью, состоянием корпуса и ёмкостью аккумулятора — в карточке видно всё сразу, поэтому дешёвый вариант легко отличить от «дешёвого, потому что менян экран».`
          : `Цена зависит от модели, памяти, состояния и ёмкости аккумулятора. Как только ${city.in} появятся объявления ${label}, они окажутся на этой странице.`,
    },
    {
      q: `Как проверить ${label} перед покупкой?`,
      a: `Проверьте IMEI, ёмкость аккумулятора, работу камер, микрофона и Face ID/сканера, посмотрите, не менян ли экран. Пошаговый список — в нашем разборе «Как проверить телефон перед покупкой».`,
    },
    {
      q: `Можно ли обменять ${label} на другую модель?`,
      a: `Прямого trade-in у сайта нет: вы продаёте свой телефон покупателю и на эти деньги берёте другой ${city.in}. Как это сделать за один заход — на странице «Обмен телефона».`,
    },
  ];

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
          <Link href={`/listings/brand/${slug}`} className="hover:text-text">
            {label}
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-text">{city.name}</span>
        </nav>

        <h1 className="text-28 font-bold md:text-40">
          {label} б/у {city.in}
        </h1>
        <p className="mt-3 max-w-[680px] text-15 leading-relaxed text-text-dim">
          {listings.length > 0 ? (
            <>
              {listings.length} объявлений {label} {city.in}
              {from != null ? `, от ${formatTenge(from)}` : ""}
              {alias ? ` (в поиске также «${alias} бу ${city.name}»)` : ""}. В каждой
              карточке видно память, состояние корпуса и ёмкость аккумулятора, а телефон
              продавца открывается после того, как он примет вашу заявку.
            </>
          ) : (
            <>
              {label} {city.in} сейчас никто не продаёт. Посмотрите другие города ниже или
              весь каталог {label} — объявления добавляют каждый день.
            </>
          )}
        </p>

        <div className="mt-6">
          <CityChips active={city} brandSlug={slug} allHref={`/listings/brand/${slug}`} />
        </div>

        {listings.length === 0 ? (
          <div className="mt-8 rounded-card border border-border bg-surface p-8 text-center">
            <p className="text-15 text-text">Пока пусто</p>
            <div className="mt-3 flex flex-wrap justify-center gap-4 text-13">
              <Link
                href={`/listings/brand/${slug}`}
                className="text-accent underline underline-offset-2"
              >
                Все {label}
              </Link>
              <Link href={cityPath(city)} className="text-accent underline underline-offset-2">
                Все телефоны {city.in}
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} heart={!!session?.user} />
            ))}
          </div>
        )}

        {models.length > 0 && (
          <section aria-labelledby="models" className="mt-12">
            <h2 id="models" className="mb-4 text-22 font-bold md:text-28">
              Модели {label} {city.in}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {models.map((m) => (
                <li key={m.slug}>
                  <Link
                    href={`/listings/model/${m.slug}`}
                    className="inline-flex items-center gap-2 rounded-pill bg-surface-2 px-4 py-2 text-13 text-text transition-colors duration-150 hover:bg-border"
                  >
                    {m.label}
                    <span className="text-text-dim">от {formatTenge(m.minPrice)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <FaqBlock qa={qa} title={`${label} ${city.in}: частые вопросы`} />
      </main>

      <SiteFooter />

      <JsonLd
        data={[
          catalogJsonLd({
            name: title(brand, city),
            description: description(brand, city, listings.length, from),
            path: brandCityPath(slug, city),
            listings,
          }),
          breadcrumbJsonLd([
            { name: "Каталог", path: "/listings" },
            { name: label, path: `/listings/brand/${slug}` },
            { name: city.name, path: brandCityPath(slug, city) },
          ]),
          faqPageJsonLd(qa),
        ]}
      />
    </>
  );
}
