import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { brandSlugs } from "@/lib/phones";
import { CITY_HUBS, cityPath } from "@/lib/geo";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Каталог",
    links: [
      { href: "/listings", label: "Все телефоны" },
      { href: `/listings/brand/${brandSlugs.APPLE}`, label: "iPhone" },
      { href: `/listings/brand/${brandSlugs.SAMSUNG}`, label: "Samsung" },
      { href: `/listings/brand/${brandSlugs.XIAOMI}`, label: "Xiaomi" },
      { href: "/listings?maxPrice=100000", label: "До 100 000 ₸" },
    ],
  },
  {
    title: "Покупателю",
    links: [
      { href: "/guides/kak-proverit-telefon-pered-pokupkoy", label: "Проверка перед покупкой" },
      { href: "/guides/proverit-imei", label: "Проверка IMEI" },
      { href: "/#how", label: "Как это работает" },
      { href: "/favorites", label: "Избранное" },
    ],
  },
  {
    title: "Продавцу",
    links: [
      { href: "/sell", label: "Продать телефон" },
      { href: "/exchange", label: "Обменять на другую модель" },
      { href: "/guides/kak-prodat-telefon-bystro", label: "Как продать быстрее" },
      { href: "/my-listings", label: "Мои объявления" },
    ],
  },
];

/**
 * Site-wide footer. The city row isn't decoration: it's the internal linking that gets
 * every geo hub crawled from any page on the site.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-[280px]">
            <Logo />
            <p className="mt-3 text-13 text-text-dim">
              Маркетплейс телефонов в Казахстане. Каждое объявление проходит модерацию,
              оплата — напрямую продавцу при встрече.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
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

        <nav aria-label="Города" className="mt-8 border-t border-border pt-6">
          <p className="mb-2 text-13 font-semibold text-text">Телефоны по городам</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {CITY_HUBS.map((c) => (
              <li key={c.slug}>
                <Link
                  href={cityPath(c)}
                  className="text-13 text-text-dim transition-colors duration-150 hover:text-text"
                >
                  Телефоны {c.in}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-6 border-t border-border pt-6 text-13 text-text-dim">
          © {new Date().getFullYear()} TheDiamond. Сайт не берёт комиссию со сделок и не
          является стороной договора купли-продажи.
        </p>
      </div>
    </footer>
  );
}
