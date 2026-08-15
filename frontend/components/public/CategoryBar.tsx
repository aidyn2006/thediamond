import Link from "next/link";
import { cn } from "@/lib/cn";
import { ui } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  brandPath,
  catalogPath,
  exchangePath,
  guidesPath,
  sellPath,
  type Locale,
} from "@/lib/routes";

/** Brands worth a permanent slot in the nav — the rest live in the chip row. */
function links(locale: Locale) {
  const t = ui(locale);
  return [
    { href: catalogPath(locale), label: t.bar.allPhones },
    { href: brandPath("APPLE", locale), label: "iPhone" },
    { href: brandPath("SAMSUNG", locale), label: "Samsung" },
    { href: brandPath("XIAOMI", locale), label: "Xiaomi" },
    { href: brandPath("HONOR", locale), label: "Honor" },
    // Explainer pages have no Kazakh twin yet, so they keep the unprefixed path.
    { href: exchangePath(), label: t.bar.exchange },
    { href: guidesPath(), label: t.bar.guides },
    { href: `${catalogPath(locale)}?maxPrice=100000`, label: t.bar.under100k, highlight: true },
  ];
}

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
  locale = DEFAULT_LOCALE,
}: {
  signedIn?: boolean;
  active?: "buy" | "sell";
  locale?: Locale;
}) {
  const t = ui(locale);
  const LINKS = links(locale);
  return (
    <div className="bg-text">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-2 md:flex-row md:items-center md:gap-6 md:px-10 md:py-2.5">
        {/* The row scrolls sideways on a phone instead of disappearing: hiding it left
            the mobile bar with nothing but the buy/sell switch, and the catalog
            entry points are the reason this bar exists. */}
        <nav
          aria-label={t.bar.catalogNav}
          className="-mx-4 flex items-center gap-4 overflow-x-auto px-4 md:mx-0 md:gap-5 md:px-0"
        >
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
          aria-label={t.bar.modeGroup}
          className="flex gap-1 rounded-pill bg-surface/10 p-1 md:ml-auto"
        >
          <Link
            href={catalogPath(locale)}
            aria-current={active === "buy" ? "page" : undefined}
            className={tabClasses(active === "buy")}
          >
            {t.bar.buy}
          </Link>
          {/* Guests land on the /sell explainer (it's the page that ranks and converts);
              members skip straight to the form. */}
          <Link
            href={signedIn ? "/listings/new" : sellPath()}
            aria-current={active === "sell" ? "page" : undefined}
            className={tabClasses(active === "sell")}
          >
            {t.bar.sell}
          </Link>
        </div>
      </div>
    </div>
  );
}
