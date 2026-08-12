import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app/AppHeader";
import { PublicHeader } from "@/components/public/PublicHeader";
import { CategoryBar } from "@/components/public/CategoryBar";
import { SiteFooter } from "@/components/public/SiteFooter";
import { ListingCard } from "@/components/listing/ListingCard";
import { FaqBlock } from "@/components/seo/FaqBlock";
import { JsonLd } from "@/components/JsonLd";
import { memberNav } from "@/lib/nav";
import {
  breadcrumbJsonLd,
  catalogJsonLd,
  faqPageJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { cityByName } from "@/lib/geo";
import { brandPath, catalogPath, cityPath, modelPath } from "@/lib/routes";
import { brandLabels, formatTenge, storageLabel } from "@/lib/phones";
import { modelRuAlias, type ModelHub as ModelHubData } from "@/lib/models";

/**
 * One page per model people actually sell ("iPhone 13", "Redmi Note 12"), built from
 * live data — see lib/models.ts. Targets the "<модель> бу купить / цена" queries, which
 * are the highest-intent ones in the tail. Lives at /<model-slug>.
 */

function title(hub: ModelHubData) {
  const alias = modelRuAlias(hub.brand, hub.model);
  return `${hub.label} б/у — купить${alias ? `, ${alias.toLowerCase()} цена` : ""}`;
}

function description(hub: ModelHubData) {
  const alias = modelRuAlias(hub.brand, hub.model);
  return `${hub.listings.length} объявлений ${hub.label} б/у от ${formatTenge(hub.minPrice)}${
    alias ? ` (${alias} бу)` : ""
  }. Память, состояние корпуса и ёмкость аккумулятора в каждой карточке. Покупка напрямую у владельца, без комиссии.`;
}

export function modelHubMetadata(hub: ModelHubData): Metadata {
  return pageMetadata({
    title: title(hub),
    description: description(hub),
    path: modelPath(hub.slug),
  });
}

export async function ModelHub({ hub }: { hub: ModelHubData }) {
  const session = await auth();

  const alias = modelRuAlias(hub.brand, hub.model);
  const storages = [...new Set(hub.listings.map((l) => l.storageGb).filter(Boolean))]
    .sort((a, b) => (a as number) - (b as number))
    .map((gb) => storageLabel(gb as number));
  const withBattery = hub.listings.filter((l) => l.batteryHealth != null);
  const avgBattery = withBattery.length
    ? Math.round(
        withBattery.reduce((sum, l) => sum + (l.batteryHealth ?? 0), 0) / withBattery.length,
      )
    : null;
  const maxPrice = Math.max(...hub.listings.map((l) => l.price));

  const qa = [
    {
      q: `Сколько стоит ${hub.label} б/у?`,
      a: `В каталоге сейчас ${hub.listings.length} шт. по цене от ${formatTenge(
        hub.minPrice,
      )} до ${formatTenge(maxPrice)}. На цену влияют память${
        storages.length > 1 ? ` (${storages.join(", ")})` : ""
      }, состояние корпуса и ёмкость аккумулятора${
        avgBattery != null ? ` — в среднем ${avgBattery}% по этим объявлениям` : ""
      }.`,
    },
    {
      q: `Как проверить ${hub.label} перед покупкой?`,
      a: `Сверьте IMEI на корпусе, в настройках и в чеке, посмотрите ёмкость аккумулятора, проверьте камеры, микрофон, динамики и датчики, убедитесь, что экран не менян. Полный чек-лист — в разборе «Как проверить телефон перед покупкой б/у».`,
    },
    {
      q: alias ? `Что ищут как «${alias} бу»?` : `Что важно знать о ${hub.label} б/у?`,
      a: alias
        ? `Это тот же ${hub.label}: в объявлениях модель написана латиницей, а в поиске её чаще набирают как «${alias.toLowerCase()}». На этой странице собраны все активные объявления по этой модели.`
        : `Смотрите не только на цену: память, состояние корпуса и ёмкость аккумулятора меняют реальную стоимость сильнее, чем год выпуска.`,
    },
  ];

  const cities = [...new Set(hub.listings.map((l) => l.city))]
    .map((name) => cityByName[name])
    .filter(Boolean);

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
          <Link href={brandPath(hub.brand)} className="hover:text-text">
            {brandLabels[hub.brand]}
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-text">{hub.model}</span>
        </nav>

        <h1 className="text-28 font-bold md:text-40">{hub.label} б/у</h1>
        <p className="mt-3 max-w-[680px] text-15 leading-relaxed text-text-dim">
          {hub.listings.length} объявлений от {formatTenge(hub.minPrice)} до{" "}
          {formatTenge(maxPrice)}
          {storages.length > 0 ? `, память: ${storages.join(", ")}` : ""}
          {avgBattery != null ? `, средняя ёмкость аккумулятора ${avgBattery}%` : ""}.{" "}
          {alias ? `Эту модель часто ищут как «${alias.toLowerCase()} бу купить». ` : ""}
          Все объявления проверены модератором, платите продавцу при встрече — сайт
          комиссию не берёт.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {hub.listings.map((l) => (
            <ListingCard key={l.id} listing={l} heart={!!session?.user} />
          ))}
        </div>

        {cities.length > 0 && (
          <section aria-labelledby="cities" className="mt-12">
            <h2 id="cities" className="mb-4 text-22 font-bold md:text-28">
              {hub.label} по городам
            </h2>
            <ul className="flex flex-wrap gap-2">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={cityPath(c)}
                    className="inline-flex rounded-pill bg-surface-2 px-4 py-2 text-13 text-text transition-colors duration-150 hover:bg-border"
                  >
                    {hub.label} {c.in}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <FaqBlock qa={qa} title={`${hub.label}: частые вопросы`} />
      </main>

      <SiteFooter />

      <JsonLd
        data={[
          catalogJsonLd({
            name: title(hub),
            description: description(hub),
            path: modelPath(hub.slug),
            listings: hub.listings,
          }),
          breadcrumbJsonLd([
            { name: "Каталог", path: catalogPath() },
            { name: brandLabels[hub.brand], path: brandPath(hub.brand) },
            { name: hub.model, path: modelPath(hub.slug) },
          ]),
          faqPageJsonLd(qa),
        ]}
      />
    </>
  );
}
