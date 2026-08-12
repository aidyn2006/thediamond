import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { PublicHeader } from "@/components/public/PublicHeader";
import { CategoryBar } from "@/components/public/CategoryBar";
import { SiteFooter } from "@/components/public/SiteFooter";
import { BrandChips } from "@/components/listing/BrandChips";
import { CityChips } from "@/components/listing/CityChips";
import { ListingSection } from "@/components/listing/ListingSection";
import { buttonClasses } from "@/components/ui/Button";
import { getPublicListings } from "@/lib/api";
import { roleHome } from "@/lib/types";
import { formatTenge } from "@/lib/phones";
import { GUIDES } from "@/lib/guides";
import { ui } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  catalogPath,
  guidePath,
  homePath,
  type Locale,
} from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

/** A row of four is the smallest set that reads as a section rather than leftovers. */
const MIN_SECTION = 4;
const CHEAP_UNDER = 100_000;
/** One full row on a wide screen, three rows of two on a phone. */
const SECTION_SIZE = 6;

export function landingMetadata(locale: Locale = DEFAULT_LOCALE): Metadata {
  const t = ui(locale);
  return pageMetadata({
    title: t.home.title,
    description: t.home.description,
    path: homePath(locale),
    altPaths: (l) => homePath(l),
    locale,
  });
}

export async function Landing({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const session = await auth();
  // Signed-in members have no use for the marketing page.
  if (session?.user) redirect(roleHome(session.user.role));

  const t = ui(locale);

  // One cached catalog call feeds every row — the backend already returns newest
  // first, so the sections are just different slices of it.
  const all = await getPublicListings();
  const newest = all.slice(0, SECTION_SIZE);
  const popular = [...all]
    .filter((l) => l.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, SECTION_SIZE);
  const cheap = all.filter((l) => l.price <= CHEAP_UNDER).slice(0, SECTION_SIZE);

  return (
    <>
      <PublicHeader locale={locale} altHref={homePath(locale === "ru" ? "kk" : "ru")} />
      <CategoryBar locale={locale} />

      <main id="main-content">
        {/* Dark band + white sheet: the phones start high on the page and the pitch
            rides along in the banner instead of owning a full screen. */}
        <div className="bg-text pb-14 pt-4">
          <div className="mx-auto max-w-[1200px] px-6 md:px-10">
            <section className="rounded-card bg-prism px-6 py-10 md:px-12 md:py-14">
              <h1 className="max-w-[640px] text-28 font-bold leading-tight text-text md:text-40">
                {t.home.h1}
              </h1>
              <p className="mt-3 max-w-[520px] text-15 text-text/80 md:text-17">
                {t.home.lead}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={catalogPath(locale)} className={buttonClasses("secondary")}>
                  {t.home.ctaBrowse}
                </Link>
                <Link href="/register" className={buttonClasses("ghost")}>
                  {t.home.ctaSell}
                </Link>
              </div>
            </section>
          </div>
        </div>

        <div className="-mt-8 rounded-t-[32px] bg-surface pb-16 pt-8">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 md:px-10">
            <BrandChips locale={locale} />

            <ListingSection
              title={t.home.newest}
              href={catalogPath(locale)}
              listings={newest}
              seeAll={t.home.seeAll}
              locale={locale}
            />

            {popular.length >= MIN_SECTION && (
              <ListingSection
                title={t.home.mostViewed}
                href={catalogPath(locale)}
                listings={popular}
                locale={locale}
              />
            )}

            {cheap.length >= MIN_SECTION && (
              <ListingSection
                title={t.home.under(formatTenge(CHEAP_UNDER))}
                href={`${catalogPath(locale)}?maxPrice=${CHEAP_UNDER}`}
                listings={cheap}
                locale={locale}
              />
            )}

            <section aria-labelledby="cities">
              <h2 id="cities" className="mb-4 text-22 font-bold md:text-28">
                {t.home.citiesHeading}
              </h2>
              <CityChips locale={locale} />
            </section>

            {/* The guides are Russian-only for now. Showing three cards of Russian prose
                on a Kazakh page would dilute the page's language signal for no gain, so
                the section simply waits for its Kazakh twins. */}
            {locale === "ru" && (
              <section aria-labelledby="guides">
                <h2 id="guides" className="mb-4 text-22 font-bold md:text-28">
                  {t.home.guidesHeading}
                </h2>
                <ul className="grid gap-4 sm:grid-cols-3">
                  {GUIDES.map((g) => (
                    <li key={g.slug}>
                      <Link
                        href={guidePath(g.slug)}
                        className="flex h-full flex-col rounded-card border border-border bg-bg p-5 transition-colors duration-150 hover:border-accent"
                      >
                        <p className="text-15 font-semibold text-text">{g.h1}</p>
                        <p className="mt-1 line-clamp-3 text-13 text-text-dim">
                          {g.description}
                        </p>
                        <p className="mt-auto pt-3 text-13 text-accent">
                          {t.home.readMinutes(g.readMinutes)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="how" id="how" className="scroll-mt-8">
              <h2 id="how" className="mb-6 text-22 font-bold md:text-28">
                {t.home.howHeading}
              </h2>
              <ol className="grid gap-4 sm:grid-cols-3">
                {t.home.steps.map(([title, text], i) => (
                  <li key={title} className="rounded-card border border-border bg-bg p-5">
                    <span className="text-13 text-accent">{t.home.step(i + 1)}</span>
                    <p className="mt-2 text-15 font-semibold">{title}</p>
                    <p className="mt-1 text-13 text-text-dim">{text}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
