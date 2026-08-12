import Link from "next/link";
import { chipClasses } from "@/lib/chips";
import { PHONE_BRANDS, brandLabels, type PhoneBrand } from "@/lib/phones";
import { ui } from "@/lib/i18n";
import { DEFAULT_LOCALE, brandPath, catalogPath, type Locale } from "@/lib/routes";
import type { CatalogFilters } from "@/lib/api-types";

/**
 * Horizontally scrollable brand row — the catalog's primary navigation now that the
 * filter form lives behind a button.
 *
 * With `params` the chips are catalog filters (they keep every other active filter and
 * only swap `brand`); without it they point at the SEO brand hubs, which is what the
 * landing page wants.
 */
export function BrandChips({
  params,
  active,
  locale = DEFAULT_LOCALE,
}: {
  params?: CatalogFilters;
  active?: PhoneBrand | null;
  locale?: Locale;
}) {
  const t = ui(locale);
  const filterMode = params != null;

  function href(brand: PhoneBrand | null): string {
    if (!filterMode) {
      return brand ? brandPath(brand, locale) : catalogPath(locale);
    }
    const qs = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (key !== "brand" && value) qs.set(key, String(value));
    });
    if (brand) qs.set("brand", brand);
    const s = qs.toString();
    return s ? `${catalogPath(locale)}?${s}` : catalogPath(locale);
  }

  return (
    <nav aria-label={t.chips.brands} className="-mx-6 px-6 md:-mx-10 md:px-10">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link href={href(null)} className={chipClasses(!active)} aria-current={!active || undefined}>
          {t.chips.allPhones}
        </Link>
        {PHONE_BRANDS.map((b) => (
          <Link
            key={b}
            href={href(b)}
            className={chipClasses(active === b)}
            aria-current={active === b || undefined}
          >
            {brandLabels[b]}
          </Link>
        ))}
      </div>
    </nav>
  );
}
