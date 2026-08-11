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
  { href: "/exchange", label: "Обмен" },
  { href: "/guides", label: "Полезное" },
  { href: "/listings?maxPrice=100000", label: "До 100 000 ₸", highlight: true },
];

function tabClasses(active: boolean) {
  return cn(
    "flex-1 rounded-pill py-2 text-center text-13 font-semibold transition-colors duration-150 md:flex-none md:px-6 md:text-15",
    active ? "bg-prism text-text" : "text-surface/70 hover:text-surface",
  );
}

/**
 * Dark bar under the header: the buy/sell switch (full width on mobile, exactly like
 * the reference) plus catalog entry points, which only fit from md up — on phones the
 * brand chips right below the title do that job.
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
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-2 md:flex-row md:items-center md:gap-6 md:px-10 md:py-2.5">
        <nav
          aria-label="Категории каталога"
          className="hidden items-center gap-5 overflow-x-auto md:flex"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "whitespace-nowrap text-15 transition-colors duration-150",
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
          className="flex gap-1 rounded-pill bg-surface/10 p-1 md:ml-auto"
        >
          <Link
            href="/listings"
            aria-current={active === "buy" ? "page" : undefined}
            className={tabClasses(active === "buy")}
          >
            Купить
          </Link>
          {/* Guests land on the /sell explainer (it's the page that ranks and converts);
              members skip straight to the form. */}
          <Link
            href={signedIn ? "/listings/new" : "/sell"}
            aria-current={active === "sell" ? "page" : undefined}
            className={tabClasses(active === "sell")}
          >
            Продать
          </Link>
        </div>
      </div>
    </div>
  );
}
