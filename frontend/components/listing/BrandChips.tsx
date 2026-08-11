import Link from "next/link";
import { cn } from "@/lib/cn";
import { PHONE_BRANDS, brandLabels, brandSlugs, type PhoneBrand } from "@/lib/phones";
import type { CatalogFilters } from "@/lib/api-types";

function chipClasses(active: boolean) {
  return cn(
    "inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-pill px-4",
    "text-13 font-semibold transition-colors duration-150 md:text-15",
    active
      ? "bg-text text-surface"
      : "bg-surface-2 text-text hover:bg-border",
  );
}

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
}: {
  params?: CatalogFilters;
  active?: PhoneBrand | null;
}) {
  const filterMode = params != null;

  function href(brand: PhoneBrand | null): string {
    if (!filterMode) {
      return brand ? `/listings/brand/${brandSlugs[brand]}` : "/listings";
    }
    const qs = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (key !== "brand" && value) qs.set(key, String(value));
    });
    if (brand) qs.set("brand", brand);
    const s = qs.toString();
    return s ? `/listings?${s}` : "/listings";
  }

  return (
    <nav aria-label="Бренды" className="-mx-6 px-6 md:-mx-10 md:px-10">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link href={href(null)} className={chipClasses(!active)} aria-current={!active || undefined}>
          Все телефоны
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
