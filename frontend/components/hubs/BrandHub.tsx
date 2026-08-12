import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app/AppHeader";
import { PublicHeader } from "@/components/public/PublicHeader";
import { CategoryBar } from "@/components/public/CategoryBar";
import { SiteFooter } from "@/components/public/SiteFooter";
import { ListingCard } from "@/components/listing/ListingCard";
import { BrandChips } from "@/components/listing/BrandChips";
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
import { brandPath, catalogPath, modelPath } from "@/lib/routes";
import {
  brandLabels,
  brandQueryLabels,
  brandRuLabels,
  formatTenge,
  type PhoneBrand,
} from "@/lib/phones";
import { groupByModel } from "@/lib/models";
import type { ListingSummary } from "@/lib/api-types";

/**
 * Brand hub — one brand, whole country, at /kupit-<brand>.
 *
 * Rendered per request (the header depends on the session), but the catalog fetch
 * underneath is cached, so a hub costs one backend call per revalidate window.
 */

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

export function brandHubMetadata(brand: PhoneBrand): Metadata {
  return pageMetadata({
    title: title(brand),
    description: description(brand),
    path: brandPath(brand),
  });
}

/**
 * Answers the questions a brand shopper actually types, using live numbers so the block
 * is never boilerplate. Written to stay true when the catalog is empty.
 */
function faq(brand: PhoneBrand, listings: ListingSummary[]) {
  const label = brandQueryLabels[brand];
  const ru = brandRuLabels[brand];
  const from = listings.length ? Math.min(...listings.map((l) => l.price)) : null;
  const cities = [...new Set(listings.map((l) => l.city))];
  const withBattery = listings.filter((l) => l.batteryHealth != null);
  const avgBattery = withBattery.length
    ? Math.round(
        withBattery.reduce((s, l) => s + (l.batteryHealth ?? 0), 0) / withBattery.length,
      )
    : null;

  return [
    {
      q: `Сколько стоит ${label} б/у в Казахстане?`,
      a:
        from != null
          ? `Сейчас в каталоге ${listings.length} объявлений ${label}, цены начинаются от ${formatTenge(
              from,
            )}. Разброс объясняется поколением, объёмом памяти, состоянием корпуса и ёмкостью аккумулятора — все четыре параметра указаны в карточке, поэтому варианты можно сравнивать, а не гадать.`
          : `Цена зависит от поколения, объёма памяти, состояния корпуса и ёмкости аккумулятора. В каждой карточке эти параметры указаны заранее, так что сравнивать можно до звонка продавцу.`,
    },
    {
      q: `Как не купить ${ru ? `${ru} ` : ""}с проблемами?`,
      a: `Проверьте IMEI через *#06# и сверьте его с коробкой, убедитесь, что продавец вышел из аккаунта (iCloud или Google), и посмотрите ёмкость аккумулятора в настройках${
        avgBattery != null ? ` — по текущим объявлениям ${label} она в среднем ${avgBattery}%` : ""
      }. Осмотр занимает 10–15 минут и снимает большую часть рисков.`,
    },
    {
      q: `В каких городах есть ${label}?`,
      a: cities.length
        ? `Прямо сейчас объявления ${label} есть в таких городах: ${cities.join(
            ", ",
          )}. Выберите город в строке выше — откроется страница только с местными предложениями, чтобы не ездить в другую область.`
        : `Мы работаем по всему Казахстану — Алматы, Астана, Шымкент и ещё десяток городов. Выберите город в строке выше, чтобы увидеть только местные предложения.`,
    },
    {
      q: `Берёте ли вы комиссию с покупки ${label}?`,
      a: `Нет. Вы отправляете заявку, продавец её принимает, и дальше вы общаетесь напрямую: встречаетесь, проверяете телефон и платите владельцу. Сайт не участвует в расчётах и не берёт процент ни с одной из сторон.`,
    },
  ];
}

export async function BrandHub({ brand }: { brand: PhoneBrand }) {
  const session = await auth();
  const label = brandLabels[brand];
  const listings = await getPublicListings({ brand });
  // Cheapest offer is the one worth putting in the intro line.
  const from = listings.length ? Math.min(...listings.map((l) => l.price)) : null;
  const models = groupByModel(listings).slice(0, 10);
  const qa = faq(brand, listings);

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
          <Link href={catalogPath()} className="hover:text-text">
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
          <CityChips brand={brand} allHref={brandPath(brand)} />
        </div>

        {listings.length === 0 ? (
          <div className="mt-8 rounded-card border border-border bg-surface p-8 text-center">
            <p className="text-15 text-text">Пока пусто</p>
            <Link
              href={catalogPath()}
              className="mt-2 inline-block text-13 text-accent underline underline-offset-2"
            >
              Весь каталог
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {listings.map((l, i) => (
              <ListingCard key={l.id} listing={l} heart={!!session?.user} priority={i < 6} />
            ))}
          </div>
        )}

        {models.length > 0 && (
          <section aria-labelledby="models" className="mt-12">
            <h2 id="models" className="mb-4 text-22 font-bold md:text-28">
              Модели {brandQueryLabels[brand]} в продаже
            </h2>
            <ul className="flex flex-wrap gap-2">
              {models.map((m) => (
                <li key={m.slug}>
                  <Link
                    href={modelPath(m.slug)}
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

        <FaqBlock qa={qa} title={`Вопросы про ${brandQueryLabels[brand]} б/у`} />
      </main>

      <SiteFooter />

      <JsonLd
        data={[
          catalogJsonLd({
            name: title(brand),
            description: description(brand),
            path: brandPath(brand),
            listings,
          }),
          breadcrumbJsonLd([
            { name: "Каталог", path: catalogPath() },
            { name: label, path: brandPath(brand) },
          ]),
          faqPageJsonLd(qa),
        ]}
      />
    </>
  );
}
