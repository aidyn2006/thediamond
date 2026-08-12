import Link from "next/link";
import { chipClasses } from "@/lib/chips";
import type { CityInfo } from "@/lib/geo";
import type { PhoneBrand } from "@/lib/phones";
import { CITY_HUBS, brandCityPath, catalogPath, cityPath } from "@/lib/routes";

/**
 * City row. On a brand hub it links brand×city pages ("iPhone в Астане"), elsewhere
 * the plain city hubs — either way it's the internal linking that gets the geo pages
 * crawled, not the sitemap alone.
 */
export function CityChips({
  active,
  brand,
  allHref = catalogPath(),
}: {
  active?: CityInfo | null;
  /** Set to link brand×city pages instead of plain city hubs. */
  brand?: PhoneBrand;
  allHref?: string;
}) {
  function href(city: CityInfo): string {
    return brand ? brandCityPath(brand, city) : cityPath(city);
  }

  return (
    <nav aria-label="Города" className="-mx-6 px-6 md:-mx-10 md:px-10">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link href={allHref} className={chipClasses(!active)}>
          Все города
        </Link>
        {CITY_HUBS.map((c) => (
          <Link
            key={c.slug}
            href={href(c)}
            className={chipClasses(active?.slug === c.slug)}
            aria-current={active?.slug === c.slug || undefined}
          >
            {c.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
