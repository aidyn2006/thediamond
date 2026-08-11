import Link from "next/link";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app/AppHeader";
import { PublicHeader } from "@/components/public/PublicHeader";
import { ListingCard } from "@/components/listing/ListingCard";
import { CatalogFilters } from "@/components/listing/CatalogFilters";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/JsonLd";
import { apiFetch, getPublicListings } from "@/lib/api";
import { memberNav } from "@/lib/nav";
import { catalogJsonLd, pageMetadata } from "@/lib/seo";
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

  return (
    <>
      {session?.user ? (
        <AppHeader email={session.user.email} items={memberNav} />
      ) : (
        <PublicHeader />
      )}

      <main id="main-content" className="mx-auto max-w-[1200px] px-6 py-8 md:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-28 font-semibold">Телефоны</h1>
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

        <CatalogFilters />

        {listings.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-8 text-center">
            <p className="text-15 text-text">Под эти фильтры ничего нет</p>
            <p className="mt-2 text-13 text-text-dim">
              Попробуйте убрать часть условий или заглянуть позже — объявления появляются каждый день.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </main>

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
