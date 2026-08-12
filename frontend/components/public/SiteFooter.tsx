import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { cityForms } from "@/lib/geo";
import { ui } from "@/lib/i18n";
import {
  CITY_HUBS,
  DEFAULT_LOCALE,
  brandPath,
  catalogPath,
  cityPath,
  exchangePath,
  guidePath,
  homePath,
  sellPath,
  type Locale,
} from "@/lib/routes";

/**
 * Site-wide footer. The city row isn't decoration: it's the internal linking that gets
 * every geo hub crawled from any page on the site.
 *
 * Guides and the member area are Russian-only for now, so those links always point at
 * the unprefixed paths — sending a Kazakh visitor to a /kk/ URL that doesn't exist would
 * be worse than sending them to a Russian page that does.
 */
export function SiteFooter({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const t = ui(locale);

  const columns = [
    {
      title: t.footer.catalog,
      links: [
        { href: catalogPath(locale), label: t.chips.allPhones },
        { href: brandPath("APPLE", locale), label: "iPhone" },
        { href: brandPath("SAMSUNG", locale), label: "Samsung" },
        { href: brandPath("XIAOMI", locale), label: "Xiaomi" },
        { href: `${catalogPath(locale)}?maxPrice=100000`, label: t.bar.under100k },
      ],
    },
    {
      title: t.footer.forBuyers,
      links: [
        { href: guidePath("kak-proverit-telefon-pered-pokupkoy"), label: t.footer.checkBeforeBuying },
        { href: guidePath("proverit-imei"), label: t.footer.checkImei },
        { href: `${homePath(locale)}#how`, label: t.footer.howItWorks },
        { href: "/favorites", label: t.footer.favorites },
      ],
    },
    {
      title: t.footer.forSellers,
      links: [
        { href: sellPath(), label: t.footer.sellPhone },
        { href: exchangePath(), label: t.footer.exchangePhone },
        { href: guidePath("kak-prodat-telefon-bystro"), label: "Как продать быстрее" },
        { href: "/my-listings", label: "Мои объявления" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-[280px]">
            <Logo />
            <p className="mt-3 text-13 text-text-dim">
              {locale === "kk"
                ? "Қазақстандағы телефон маркетплейсі. Әр хабарландыру модерациядан өтеді, төлем — кездескен жерде сатушыға тікелей."
                : "Маркетплейс телефонов в Казахстане. Каждое объявление проходит модерацию, оплата — напрямую продавцу при встрече."}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="mb-2 text-13 font-semibold text-text">{col.title}</p>
                <ul className="flex flex-col gap-1.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-13 text-text-dim transition-colors duration-150 hover:text-text"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <nav aria-label={t.chips.cities} className="mt-8 border-t border-border pt-6">
          <p className="mb-2 text-13 font-semibold text-text">{t.footer.citiesTitle}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {CITY_HUBS.map((c) => {
              const f = cityForms(c, locale);
              return (
                <li key={c.slug}>
                  <Link
                    href={cityPath(c, locale)}
                    className="text-13 text-text-dim transition-colors duration-150 hover:text-text"
                  >
                    {locale === "kk" ? `${f.in} телефондар` : `Телефоны ${f.in}`}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <p className="mt-6 border-t border-border pt-6 text-13 text-text-dim">
          © {new Date().getFullYear()} TheDiamond.{" "}
          {locale === "kk"
            ? "Сайт мәмілелерден комиссия алмайды және сатып алу-сату шартының тарапы емес."
            : "Сайт не берёт комиссию со сделок и не является стороной договора купли-продажи."}
        </p>
      </div>
    </footer>
  );
}
