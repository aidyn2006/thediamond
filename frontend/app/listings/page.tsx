import Link from "next/link";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app/AppHeader";
import { PublicHeader } from "@/components/public/PublicHeader";
import { CategoryBar } from "@/components/public/CategoryBar";
import { SiteFooter } from "@/components/public/SiteFooter";
import { ListingCard } from "@/components/listing/ListingCard";
import { BrandChips } from "@/components/listing/BrandChips";
import { CityChips } from "@/components/listing/CityChips";
import { FilterSheet } from "@/components/listing/FilterSheet";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/JsonLd";
import { apiFetch, getPublicListings } from "@/lib/api";
import { memberNav } from "@/lib/nav";
import { catalogJsonLd, pageMetadata } from "@/lib/seo";
import { PHONE_BRANDS, brandLabels, type PhoneBrand } from "@/lib/phones";
import { cityByName } from "@/lib/geo";
import type { CatalogFilters as Filters, ListingSummary } from "@/lib/api-types";

export const metadata = pageMetadata({
  title: "Телефоны б/у и новые — каталог объявлений",
  description:
    "Объявления о продаже телефонов в Казахстане: iPhone, Samsung, Xiaomi. Фильтры по бренду, памяти, состоянию и городу.",
  path: "/listings",
});

function toQuery(params: Filters): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) qs.set(key, String(value));
  });
  return qs.toString() ? `?${qs}` : "";
}

/**
 * The catalog is the marketplace's main SEO surface, so it renders for guests too.
 * Signed-in members go through the authenticated endpoint (it powers their own
 * favourite/deal state elsewhere); guests read the cached public one.
 */
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  const session = await auth();
  const filters = await searchParams;

  let listings: ListingSummary[];
  if (session?.user) {
    const res = await apiFetch(`/api/listings${toQuery(filters)}`);
    listings = res.ok ? await res.json() : [];
  } else {
    listings = await getPublicListings(filters);
  }

  const activeBrand = PHONE_BRANDS.includes(filters.brand as PhoneBrand)
    ? (filters.brand as PhoneBrand)
    : null;
  const activeCity = filters.city ? (cityByName[filters.city] ?? null) : null;

  return (
    <>
      {session?.user ? (
        <AppHeader email={session.user.email} items={memberNav} />
      ) : (
        <PublicHeader />
      )}
      <CategoryBar signedIn={!!session?.user} />

      <main
        id="main-content"
        className="mx-auto max-w-[1200px] px-6 pb-12 pt-6 md:px-10"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-28 font-bold">
              {activeBrand ? brandLabels[activeBrand] : "Телефоны"}
            </h1>
            <p className="mt-1 text-13 text-text-dim">
              {listings.length > 0
                ? `${listings.length} объявлений`
                : "Пока ничего не нашлось"}
            </p>
          </div>
          <Link href={session?.user ? "/listings/new" : "/register"}>
            <Button variant="primary">Продать телефон</Button>
          </Link>
        </div>

        {/* Brands stay pinned while the grid scrolls — switching brand is the move
            people make most, and it costs no modal. */}
        <div className="sticky top-0 z-20 bg-bg pb-3 pt-2">
          <BrandChips params={filters} active={activeBrand} />
        </div>

        {/* City row links the geo hubs rather than filtering in place: those pages are
            what rank for "телефоны бу Астана", and users end up in the same list. */}
        <div className="mb-4">
          <CityChips active={activeCity} />
        </div>

        <div className="mb-6">
          <FilterSheet />
        </div>

        {listings.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-8 text-center">
            <p className="text-15 text-text">Под эти фильтры ничего нет</p>
            <p className="mt-2 text-13 text-text-dim">
              Попробуйте убрать часть условий или заглянуть позже — объявления появляются каждый день.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {listings.map((l, i) => (
              <ListingCard key={l.id} listing={l} heart={!!session?.user} priority={i < 6} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />

      <JsonLd
        data={catalogJsonLd({
          name: "Телефоны б/у и новые — каталог объявлений",
          description:
            "Объявления о продаже телефонов в Казахстане: iPhone, Samsung, Xiaomi. Фильтры по бренду, памяти, состоянию и городу.",
          path: "/listings",
          listings,
        })}
      />
    </>
  );
}
