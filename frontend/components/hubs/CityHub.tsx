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
import { cityForms, type CityInfo } from "@/lib/geo";
import { cityHubCopy } from "@/lib/hub-copy";
import { ui } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  brandCityPath,
  catalogPath,
  cityPath,
  modelPath,
  type Locale,
} from "@/lib/routes";
import { brandLabels, formatTenge } from "@/lib/phones";
import { groupByModel } from "@/lib/models";
import type { ListingSummary } from "@/lib/api-types";

/**
 * City hub — every phone on sale in one city, at /telefony-<slug> (/kk/telefondar-<slug>).
 *
 * Rendered by the flat-slug route in both locales; all copy comes from lib/hub-copy.ts so
 * the two languages stay structurally identical and neither drifts into a translation of
 * the other.
 */

// Brands worth linking from a city page — the ones people search by name.
const LINKED_BRANDS = ["APPLE", "SAMSUNG", "XIAOMI", "HONOR", "HUAWEI", "REALME"] as const;

function stats(listings: ListingSummary[]) {
  return {
    count: listings.length,
    from: listings.length ? Math.min(...listings.map((l) => l.price)) : null,
    cheap: listings.filter((l) => l.price <= 100_000).length,
  };
}

export async function cityHubMetadata(
  city: CityInfo,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Metadata> {
  const listings = await getPublicListings({ city: city.name });
  const copy = cityHubCopy(city, locale, stats(listings));
  return pageMetadata({
    title: copy.title,
    description: copy.description,
    path: cityPath(city, locale),
    altPaths: (l) => cityPath(city, l),
    locale,
    // An empty city page has nothing to rank for — keep it out of the index until
    // somebody posts there, but keep it crawlable so the links still work.
    index: listings.length > 0,
  });
}

export async function CityHub({
  city,
  locale = DEFAULT_LOCALE,
}: {
  city: CityInfo;
  locale?: Locale;
}) {
  const session = await auth();
  const t = ui(locale);
  const f = cityForms(city, locale);
  const listings = await getPublicListings({ city: city.name });
  const s = stats(listings);
  const copy = cityHubCopy(city, locale, s);
  const models = groupByModel(listings).slice(0, 8);

  return (
    <>
      {session?.user ? (
        <AppHeader email={session.user.email} items={memberNav} />
      ) : (
        <PublicHeader
          locale={locale}
          altHref={cityPath(city, locale === "ru" ? "kk" : "ru")}
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
          <span className="text-text">{f.name}</span>
        </nav>

        <h1 className="text-28 font-bold md:text-40">{copy.h1}</h1>
        <p className="mt-3 max-w-[680px] text-15 leading-relaxed text-text-dim">
          {copy.intro}
        </p>

        <div className="mt-6">
          <CityChips active={city} locale={locale} />
        </div>

        {listings.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 text-13">
            <span className="text-text-dim">{copy.linkedLabel}</span>
            {LINKED_BRANDS.map((b) => (
              <Link
                key={b}
                href={brandCityPath(b, city, locale)}
                className="text-accent underline underline-offset-2"
              >
                {brandLabels[b]} {f.in}
              </Link>
            ))}
          </div>
        )}

        {listings.length === 0 ? (
          <div className="mt-8 rounded-card border border-border bg-surface p-8 text-center">
            <p className="text-15 text-text">{t.common.empty}</p>
            <Link
              href={catalogPath(locale)}
              className="mt-2 inline-block text-13 text-accent underline underline-offset-2"
            >
              {t.common.wholeCatalog}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {listings.map((l, i) => (
              <ListingCard
                key={l.id}
                listing={l}
                heart={!!session?.user}
                priority={i < 6}
                locale={locale}
              />
            ))}
          </div>
        )}

        {models.length > 0 && (
          <section aria-labelledby="models" className="mt-12">
            <h2 id="models" className="mb-4 text-22 font-bold md:text-28">
              {copy.modelsHeading}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {models.map((m) => (
                <li key={m.slug}>
                  <Link
                    href={modelPath(m.slug, locale)}
                    className="inline-flex items-center gap-2 rounded-pill bg-surface-2 px-4 py-2 text-13 text-text transition-colors duration-150 hover:bg-border"
                  >
                    {m.label}
                    <span className="text-text-dim">
                      {t.common.from} {formatTenge(m.minPrice)}
                    </span>
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
            path: cityPath(city, locale),
            listings,
            locale,
          }),
          breadcrumbJsonLd([
            { name: t.common.catalog, path: catalogPath(locale) },
            { name: f.name, path: cityPath(city, locale) },
          ]),
          faqPageJsonLd(copy.faq),
        ]}
      />
    </>
  );
}
