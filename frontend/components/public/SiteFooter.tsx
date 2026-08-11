import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { brandSlugs } from "@/lib/phones";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Каталог",
    links: [
      { href: "/listings", label: "Все телефоны" },
      { href: `/listings/brand/${brandSlugs.APPLE}`, label: "iPhone" },
      { href: `/listings/brand/${brandSlugs.SAMSUNG}`, label: "Samsung" },
      { href: `/listings/brand/${brandSlugs.XIAOMI}`, label: "Xiaomi" },
      { href: `/listings/brand/${brandSlugs.HONOR}`, label: "Honor" },
    ],
  },
  {
    title: "Покупателю",
    links: [
      { href: "/#how", label: "Как это работает" },
      { href: "/listings?maxPrice=100000", label: "До 100 000 ₸" },
      { href: "/favorites", label: "Избранное" },
      { href: "/deals", label: "Мои сделки" },
    ],
  },
  {
    title: "Продавцу",
    links: [
      { href: "/listings/new", label: "Продать телефон" },
      { href: "/my-listings", label: "Мои объявления" },
      { href: "/profile", label: "Профиль" },
    ],
  },
];

/** Site-wide footer for the landing page, the catalog and the brand hubs. */
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

        <p className="mt-8 border-t border-border pt-6 text-13 text-text-dim">
          © {new Date().getFullYear()} TheDiamond. Сайт не берёт комиссию со сделок и не
          является стороной договора купли-продажи.
        </p>
      </div>
    </footer>
  );
}
