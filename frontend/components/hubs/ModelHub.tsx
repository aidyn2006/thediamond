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
import { cityByName, cityForms } from "@/lib/geo";
import { modelHubCopy } from "@/lib/hub-copy";
import { ui } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  brandPath,
  catalogPath,
  cityPath,
  modelPath,
  type Locale,
} from "@/lib/routes";
import { brandLabels, storageLabel } from "@/lib/phones";
import type { ModelHub as ModelHubData } from "@/lib/models";

/**
 * One page per model people actually sell ("iPhone 13", "Redmi Note 12"), built from
 * live data — see lib/models.ts. Targets the "<модель> бу купить / цена" queries, which
 * are the highest-intent ones in the tail. Lives at /<model-slug>.
 */

function stats(hub: ModelHubData) {
  const withBattery = hub.listings.filter((l) => l.batteryHealth != null);
  return {
    maxPrice: Math.max(...hub.listings.map((l) => l.price)),
    storages: [...new Set(hub.listings.map((l) => l.storageGb).filter(Boolean))]
      .sort((a, b) => (a as number) - (b as number))
      .map((gb) => storageLabel(gb as number)),
    avgBattery: withBattery.length
      ? Math.round(
          withBattery.reduce((sum, l) => sum + (l.batteryHealth ?? 0), 0) / withBattery.length,
        )
      : null,
  };
}

export function modelHubMetadata(
  hub: ModelHubData,
  locale: Locale = DEFAULT_LOCALE,
): Metadata {
  const copy = modelHubCopy(hub, locale, stats(hub));
  return pageMetadata({
    title: copy.title,
    description: copy.description,
    path: modelPath(hub.slug, locale),
    altPaths: (l) => modelPath(hub.slug, l),
    locale,
  });
}

export async function ModelHub({
  hub,
  locale = DEFAULT_LOCALE,
}: {
  hub: ModelHubData;
  locale?: Locale;
}) {
  const session = await auth();
  const t = ui(locale);
  const copy = modelHubCopy(hub, locale, stats(hub));

  const cities = [...new Set(hub.listings.map((l) => l.city))]
    .map((name) => cityByName[name])
    .filter(Boolean);

  return (
    <>
      {session?.user ? (
        <AppHeader email={session.user.email} items={memberNav} />
      ) : (
        <PublicHeader
          locale={locale}
          altHref={modelPath(hub.slug, locale === "ru" ? "kk" : "ru")}
        />
      )}
      <CategoryBar signedIn={!!session?.user} locale={locale} />

      <main id="main-content" className="mx-auto max-w-[1200px] px-6 py-8 md:px-10">
        <nav aria-label={t.common.breadcrumbs} className="mb-4 text-13 text-text-dim">
          <Link href={catalogPath(locale)} className="hover:text-text">
            {t.common.catalog}
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <Link href={brandPath(hub.brand, locale)} className="hover:text-text">
            {brandLabels[hub.brand]}
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-text">{hub.model}</span>
        </nav>

        <h1 className="text-28 font-bold md:text-40">{copy.h1}</h1>
        <p className="mt-3 max-w-[680px] text-15 leading-relaxed text-text-dim">
          {copy.intro}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {hub.listings.map((l, i) => (
            <ListingCard
              key={l.id}
              listing={l}
              heart={!!session?.user}
              priority={i < 6}
              locale={locale}
            />
          ))}
        </div>

        {cities.length > 0 && (
          <section aria-labelledby="cities" className="mt-12">
            <h2 id="cities" className="mb-4 text-22 font-bold md:text-28">
              {copy.citiesHeading}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={cityPath(c, locale)}
                    className="inline-flex rounded-pill bg-surface-2 px-4 py-2 text-13 text-text transition-colors duration-150 hover:bg-border"
                  >
                    {locale === "kk"
                      ? `${cityForms(c, locale).in} ${hub.label}`
                      : `${hub.label} ${cityForms(c, locale).in}`}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <FaqBlock qa={copy.faq} title={copy.faqTitle} locale={locale} />
      </main>

      <SiteFooter locale={locale} />

      <JsonLd
        data={[
          catalogJsonLd({
            name: copy.title,
            description: copy.description,
            path: modelPath(hub.slug, locale),
            listings: hub.listings,
            locale,
          }),
          breadcrumbJsonLd([
            { name: t.common.catalog, path: catalogPath(locale) },
            { name: brandLabels[hub.brand], path: brandPath(hub.brand, locale) },
            { name: hub.model, path: modelPath(hub.slug, locale) },
          ]),
          faqPageJsonLd(copy.faq),
        ]}
      />
    </>
  );
}
