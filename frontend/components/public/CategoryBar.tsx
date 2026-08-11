import Link from "next/link";
import { cn } from "@/lib/cn";
import { brandSlugs } from "@/lib/phones";

/** Brands worth a permanent slot in the nav — the rest live in the chip row. */
const LINKS: { href: string; label: string; highlight?: boolean }[] = [
  { href: "/listings", label: "Все телефоны" },
  { href: `/listings/brand/${brandSlugs.APPLE}`, label: "iPhone" },
  { href: `/listings/brand/${brandSlugs.SAMSUNG}`, label: "Samsung" },
  { href: `/listings/brand/${brandSlugs.XIAOMI}`, label: "Xiaomi" },
  { href: `/listings/brand/${brandSlugs.HONOR}`, label: "Honor" },
  { href: "/listings?maxPrice=100000", label: "До 100 000 ₸", highlight: true },
];

/**
 * Dark category bar under the header: catalog entry points on the left, the
 * buy/sell switch on the right. Scrolls horizontally on narrow screens rather than
 * wrapping into two rows.
 */
export function CategoryBar({
  signedIn = false,
  active = "buy",
}: {
  signedIn?: boolean;
  active?: "buy" | "sell";
}) {
  return (
    <div className="bg-text">
      <div className="mx-auto flex max-w-[1200px] items-center gap-6 overflow-x-auto px-6 py-2.5 md:px-10">
        <nav aria-label="Категории каталога" className="flex items-center gap-5">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "whitespace-nowrap text-13 transition-colors duration-150 md:text-15",
                l.highlight
                  ? "font-semibold text-mint hover:brightness-110"
                  : "text-surface/80 hover:text-surface",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div
          role="group"
          aria-label="Купить или продать"
          className="ml-auto flex shrink-0 gap-1 rounded-pill bg-surface/10 p-1"
        >
          <Link
            href="/listings"
            aria-current={active === "buy" ? "page" : undefined}
            className={cn(
              "rounded-pill px-5 py-1.5 text-13 font-semibold transition-colors duration-150 md:text-15",
              active === "buy"
                ? "bg-prism text-text"
                : "text-surface/80 hover:text-surface",
            )}
          >
            Купить
          </Link>
          <Link
            href={signedIn ? "/listings/new" : "/register"}
            aria-current={active === "sell" ? "page" : undefined}
            className={cn(
              "rounded-pill px-5 py-1.5 text-13 font-semibold transition-colors duration-150 md:text-15",
              active === "sell"
                ? "bg-prism text-text"
                : "text-surface/80 hover:text-surface",
            )}
          >
            Продать
          </Link>
        </div>
      </div>
    </div>
  );
}
