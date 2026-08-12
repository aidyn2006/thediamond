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
import { brandCityHubCopy } from "@/lib/hub-copy";
import { ui } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  brandCityPath,
  brandPath,
  catalogPath,
  cityPath,
  modelPath,
  type Locale,
} from "@/lib/routes";
import { brandQueryLabels, formatTenge, type PhoneBrand } from "@/lib/phones";
import { groupByModel } from "@/lib/models";
import type { ListingSummary } from "@/lib/api-types";

/**
 * Brand × city — the shape most Kazakh queries actually take ("iphone бу цена Астана"),
 * at /kupit-<brand>-<city> (/kk/<brand>-<city>-satyp-alu).
 *
 * Combinations with nothing to show are noindex (but still crawlable), so we never
 * publish 200+ empty pages just because the grid is possible.
 */

function stats(listings: ListingSummary[]) {
  return {
    count: listings.length,
    from: listings.length ? Math.min(...listings.map((l) => l.price)) : null,
  };
}

export async function brandCityHubMetadata(
  brand: PhoneBrand,
  city: CityInfo,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Metadata> {
  const listings = await getPublicListings({ brand, city: city.name });
  const copy = brandCityHubCopy(brand, city, locale, stats(listings));
  return pageMetadata({
    title: copy.title,
    description: copy.description,
    path: brandCityPath(brand, city, locale),
    altPaths: (l) => brandCityPath(brand, city, l),
    locale,
    index: listings.length > 0,
  });
}

export async function BrandCityHub({
  brand,
  city,
  locale = DEFAULT_LOCALE,
}: {
  brand: PhoneBrand;
  city: CityInfo;
  locale?: Locale;
}) {
  const session = await auth();
  const t = ui(locale);
  const f = cityForms(city, locale);

  // Query label throughout: the page is here to answer "iphone бу Астана", so the
  // visible copy should read the same way.
  const label = brandQueryLabels[brand];
  const listings = await getPublicListings({ brand, city: city.name });
  const copy = brandCityHubCopy(brand, city, locale, stats(listings));
  const models = groupByModel(listings).slice(0, 8);

  return (
    <>
      {session?.user ? (
        <AppHeader email={session.user.email} items={memberNav} />
      ) : (
        <PublicHeader
          locale={locale}
          altHref={brandCityPath(brand, city, locale === "ru" ? "kk" : "ru")}
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
          <Link href={brandPath(brand, locale)} className="hover:text-text">
            {label}
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
          <CityChips
            active={city}
            brand={brand}
            allHref={brandPath(brand, locale)}
            locale={locale}
          />
        </div>

        {listings.length === 0 ? (
          <div className="mt-8 rounded-card border border-border bg-surface p-8 text-center">
            <p className="text-15 text-text">{t.common.empty}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-4 text-13">
              <Link
                href={brandPath(brand, locale)}
                className="text-accent underline underline-offset-2"
              >
                {copy.emptyAllBrand}
              </Link>
              <Link
                href={cityPath(city, locale)}
                className="text-accent underline underline-offset-2"
              >
                {copy.emptyAllCity}
              </Link>
            </div>
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
            path: brandCityPath(brand, city, locale),
            listings,
            locale,
          }),
          breadcrumbJsonLd([
            { name: t.common.catalog, path: catalogPath(locale) },
            { name: label, path: brandPath(brand, locale) },
            { name: f.name, path: brandCityPath(brand, city, locale) },
          ]),
          faqPageJsonLd(copy.faq),
        ]}
      />
    </>
  );
}
