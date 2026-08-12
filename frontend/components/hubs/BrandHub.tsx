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
import { cityByName, cityForms } from "@/lib/geo";
import { brandHubCopy } from "@/lib/hub-copy";
import { ui } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  brandPath,
  catalogPath,
  modelPath,
  type Locale,
} from "@/lib/routes";
import { brandLabels, formatTenge, type PhoneBrand } from "@/lib/phones";
import { groupByModel } from "@/lib/models";
import type { ListingSummary } from "@/lib/api-types";

/**
 * Brand hub — one brand, whole country, at /kupit-<brand> (/kk/<brand>-satyp-alu).
 *
 * Rendered per request (the header depends on the session), but the catalog fetch
 * underneath is cached, so a hub costs one backend call per revalidate window.
 */

function stats(listings: ListingSummary[], locale: Locale) {
  const withBattery = listings.filter((l) => l.batteryHealth != null);
  return {
    count: listings.length,
    from: listings.length ? Math.min(...listings.map((l) => l.price)) : null,
    // City names are localised for display; the underlying data key stays Russian.
    cities: [...new Set(listings.map((l) => l.city))].map(
      (n) => (cityByName[n] ? cityForms(cityByName[n], locale).name : n),
    ),
    avgBattery: withBattery.length
      ? Math.round(
          withBattery.reduce((s, l) => s + (l.batteryHealth ?? 0), 0) / withBattery.length,
        )
      : null,
  };
}

export async function brandHubMetadata(
  brand: PhoneBrand,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Metadata> {
  const listings = await getPublicListings({ brand });
  const copy = brandHubCopy(brand, locale, stats(listings, locale));
  return pageMetadata({
    title: copy.title,
    description: copy.description,
    path: brandPath(brand, locale),
    altPaths: (l) => brandPath(brand, l),
    locale,
  });
}

export async function BrandHub({
  brand,
  locale = DEFAULT_LOCALE,
}: {
  brand: PhoneBrand;
  locale?: Locale;
}) {
  const session = await auth();
  const t = ui(locale);
  const label = brandLabels[brand];
  const listings = await getPublicListings({ brand });
  const copy = brandHubCopy(brand, locale, stats(listings, locale));
  const models = groupByModel(listings).slice(0, 10);

  return (
    <>
      {session?.user ? (
        <AppHeader email={session.user.email} items={memberNav} />
      ) : (
        <PublicHeader
          locale={locale}
          altHref={brandPath(brand, locale === "ru" ? "kk" : "ru")}
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
          <span className="text-text">{label}</span>
        </nav>

        <h1 className="text-28 font-bold md:text-40">{copy.h1}</h1>
        <p className="mt-3 max-w-[680px] text-15 leading-relaxed text-text-dim">
          {copy.intro}
        </p>

        <div className="mt-6">
          <BrandChips active={brand} locale={locale} />
        </div>

        {/* Brand × city links: the shape most local queries take. */}
        <div className="mt-3">
          <CityChips brand={brand} allHref={brandPath(brand, locale)} locale={locale} />
        </div>

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
            path: brandPath(brand, locale),
            listings,
            locale,
          }),
          breadcrumbJsonLd([
            { name: t.common.catalog, path: catalogPath(locale) },
            { name: label, path: brandPath(brand, locale) },
          ]),
          faqPageJsonLd(copy.faq),
        ]}
      />
    </>
  );
}
