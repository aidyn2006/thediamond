import Link from "next/link";
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
import type { CityInfo } from "@/lib/geo";
import { brandCityPath, catalogPath, cityPath, modelPath } from "@/lib/routes";
import { brandLabels, formatTenge } from "@/lib/phones";
import { groupByModel } from "@/lib/models";
import type { ListingSummary } from "@/lib/api-types";

/**
 * City hub — every phone on sale in one city, at /telefony-<slug>.
 *
 * Rendered by the flat-slug route (app/[slug]); kept as a component so the same page can
 * be mounted under a locale prefix without duplicating it.
 */

// Brands worth linking from a city page — the ones people search by name.
const LINKED_BRANDS = ["APPLE", "SAMSUNG", "XIAOMI", "HONOR", "HUAWEI", "REALME"] as const;

function title(city: CityInfo) {
  return `Телефоны б/у ${city.in} — купить или продать, цены`;
}

function description(city: CityInfo, count: number, from: number | null) {
  const priced = from != null ? ` от ${formatTenge(from)}` : "";
  return count > 0
    ? `${count} объявлений о продаже телефонов ${city.in}${priced}: iPhone, Samsung, Xiaomi. Покупайте напрямую у владельца без комиссии, встречайтесь и проверяйте телефон на месте.`
    : `Объявления о продаже телефонов ${city.in}: iPhone, Samsung, Xiaomi б/у и новые. Покупка напрямую у владельца, без комиссии сайта.`;
}

export async function cityHubMetadata(city: CityInfo): Promise<Metadata> {
  const listings = await getPublicListings({ city: city.name });
  const from = listings.length ? Math.min(...listings.map((l) => l.price)) : null;
  return pageMetadata({
    title: title(city),
    description: description(city, listings.length, from),
    path: cityPath(city),
    // An empty city page has nothing to rank for — keep it out of the index until
    // somebody posts there, but keep it crawlable so the links still work.
    index: listings.length > 0,
  });
}

function faq(city: CityInfo, listings: ListingSummary[]) {
  const from = listings.length ? Math.min(...listings.map((l) => l.price)) : null;
  const cheap = listings.filter((l) => l.price <= 100_000).length;
  return [
    {
      q: `Где купить дешёвый айфон ${city.in}?`,
      a:
        cheap > 0
          ? `Сейчас ${city.in} есть ${cheap} объявлений дешевле 100 000 ₸ — отфильтруйте каталог по цене и смотрите состояние аккумулятора в карточке. Дешёвые варианты чаще всего это iPhone 11, 12 и SE с ёмкостью АКБ 80–90%.`
          : `Отфильтруйте каталог по цене «до 100 000 ₸» — в эту сумму ${city.in} обычно попадают iPhone 11, 12 и SE. Объявления добавляют каждый день, поэтому имеет смысл заглядывать регулярно.`,
    },
    {
      q: `Сколько стоит телефон б/у ${city.in}?`,
      a:
        from != null
          ? `Цены ${city.in} начинаются от ${formatTenge(from)}. Итоговая сумма зависит от модели, памяти, состояния корпуса и ёмкости аккумулятора — все эти параметры указаны в каждом объявлении.`
          : `Цена зависит от модели, объёма памяти, состояния корпуса и ёмкости аккумулятора. В каждом объявлении эти параметры указаны, поэтому можно сравнивать варианты между собой, а не только по цене.`,
    },
    {
      q: `Как проходит сделка ${city.in}?`,
      a: `Вы отправляете заявку продавцу, он её принимает — и вы видите его телефон. Дальше договариваетесь о встрече ${city.in}, проверяете телефон на месте и платите напрямую владельцу. Сайт не берёт комиссию и не участвует в расчётах.`,
    },
    {
      q: `Можно ли продать свой телефон ${city.in}?`,
      a: `Да. Зарегистрируйтесь, добавьте фото, укажите модель, память, состояние и цену — объявление пройдёт модерацию и появится в каталоге. Комиссии нет, деньги вы получаете от покупателя напрямую.`,
    },
  ];
}

export async function CityHub({ city }: { city: CityInfo }) {
  const session = await auth();
  const listings = await getPublicListings({ city: city.name });
  const from = listings.length ? Math.min(...listings.map((l) => l.price)) : null;
  const models = groupByModel(listings).slice(0, 8);
  const qa = faq(city, listings);

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
          <span className="text-text">{city.name}</span>
        </nav>

        <h1 className="text-28 font-bold md:text-40">Телефоны б/у {city.in}</h1>
        <p className="mt-3 max-w-[680px] text-15 leading-relaxed text-text-dim">
          {listings.length > 0 ? (
            <>
              {listings.length} объявлений {city.in}
              {from != null ? `, от ${formatTenge(from)}` : ""}. Каждое проходит проверку
              модератора: фото, модель, память, состояние корпуса и ёмкость аккумулятора
              указаны заранее. Продавцы — обычные владельцы {city.from}, а не перекупы,
              поэтому вы договариваетесь напрямую и платите при встрече, без комиссии сайта.
            </>
          ) : (
            <>
              Пока {city.in} нет активных объявлений. Посмотрите соседние города или
              выставите свой телефон — он появится в каталоге сразу после модерации.
            </>
          )}
        </p>

        <div className="mt-6">
          <CityChips active={city} />
        </div>

        {listings.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 text-13">
            <span className="text-text-dim">Ищут {city.in}:</span>
            {LINKED_BRANDS.map((b) => (
              <Link
                key={b}
                href={brandCityPath(b, city)}
                className="text-accent underline underline-offset-2"
              >
                {brandLabels[b]} {city.in}
              </Link>
            ))}
          </div>
        )}

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
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} heart={!!session?.user} />
            ))}
          </div>
        )}

        {models.length > 0 && (
          <section aria-labelledby="models" className="mt-12">
            <h2 id="models" className="mb-4 text-22 font-bold md:text-28">
              Популярные модели {city.in}
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

        <FaqBlock qa={qa} title={`Вопросы о покупке телефона ${city.in}`} />
      </main>

      <SiteFooter />

      <JsonLd
        data={[
          catalogJsonLd({
            name: title(city),
            description: description(city, listings.length, from),
            path: cityPath(city),
            listings,
          }),
          breadcrumbJsonLd([
            { name: "Каталог", path: catalogPath() },
            { name: city.name, path: cityPath(city) },
          ]),
          faqPageJsonLd(qa),
        ]}
      />
    </>
  );
}
