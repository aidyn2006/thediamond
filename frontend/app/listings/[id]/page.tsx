import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app/AppHeader";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PhotoGallery } from "@/components/listing/PhotoGallery";
import { BuyButton } from "@/components/listing/BuyButton";
import { FavoriteButton } from "@/components/listing/FavoriteButton";
import { ListingCard } from "@/components/listing/ListingCard";
import { JsonLd } from "@/components/JsonLd";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { apiFetch, getPublicListing, getPublicListings } from "@/lib/api";
import { memberNav } from "@/lib/nav";
import {
  breadcrumbJsonLd,
  listingDescription,
  listingJsonLd,
  pageMetadata,
  type ListingSeoInput,
} from "@/lib/seo";
import { listingPath, parseListingId } from "@/lib/listing-url";
import { cityByName, cityPath } from "@/lib/geo";
import { modelSlugOf } from "@/lib/models";
import { listingStatusPill } from "@/lib/status";
import {
  brandLabels,
  brandSlugs,
  conditionLabels,
  formatTenge,
  relativeDate,
  storageLabel,
} from "@/lib/phones";
import type { ListingDetail, PublicListing } from "@/lib/api-types";

/** How many same-brand phones to link at the bottom — enough for crawlers to walk the catalog. */
const RELATED = 4;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: param } = await params;
  const id = parseListingId(param);
  const listing = id ? await getPublicListing(id) : null;
  if (!listing) return pageMetadata({ title: "Объявление не найдено", index: false });

  const meta = pageMetadata({
    title: `${listing.title} — ${formatTenge(listing.price)}, ${listing.city}`,
    description: listingDescription(listing),
    // Canonical is always the slug URL, so a numeric or stale-slug link never
    // competes with it in the index.
    path: listingPath(listing),
    ogType: "article",
  });
  return {
    ...meta,
    other: {
      "product:price:amount": String(listing.price),
      "product:price:currency": "KZT",
      "product:availability": listing.status === "SOLD" ? "oos" : "instock",
    },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id: param } = await params;
  const id = parseListingId(param);
  if (!id) notFound();

  // Signed-in members get the full view (favourite state, deal state, seller phone
  // once accepted). Guests get the cached public projection, which never has a phone.
  let listing: ListingDetail | null = null;
  let publicListing: PublicListing | null = null;

  if (session?.user) {
    const res = await apiFetch(`/api/listings/${id}`);
    if (!res.ok) notFound();
    listing = await res.json();
  } else {
    publicListing = await getPublicListing(id);
    if (!publicListing) notFound();
  }

  const view = listing ?? publicListing!;
  const status = listing ? listingStatusPill[listing.status] : null;
  const sold = view.status === "SOLD";
  const canonical = listingPath(view);

  // Any other spelling of this id (bare number, slug from before an edit) is a
  // duplicate: send it to the canonical URL with a 308 instead of relying on the
  // canonical tag alone.
  if (`/listings/${param}` !== canonical) permanentRedirect(canonical);

  const sellerName = listing ? listing.seller.displayName : publicListing!.sellerName;
  const sellerId = listing ? listing.seller.id : publicListing!.sellerId;

  // City hub the phone belongs to (null for a city we don't have a landing page for).
  const cityHub = cityByName[view.city] ?? null;

  const seo: ListingSeoInput = {
    id: view.id,
    title: view.title,
    brand: view.brand,
    model: view.model,
    storageGb: view.storageGb,
    ramGb: view.ramGb,
    color: view.color,
    condition: view.condition,
    batteryHealth: view.batteryHealth,
    price: view.price,
    city: view.city,
    description: view.description,
    images: view.images,
    sellerName,
    status: view.status,
  };

  // Same-brand phones: internal links so every listing is reachable in two clicks
  // from any other one, which is what actually gets the long tail crawled.
  const related = (await getPublicListings({ brand: view.brand }))
    .filter((l) => l.id !== view.id)
    .slice(0, RELATED);

  const specs: [string, string][] = [
    ["Бренд", brandLabels[view.brand]],
    ["Модель", view.model],
    ["Память", view.storageGb ? storageLabel(view.storageGb) : "—"],
    ["ОЗУ", view.ramGb ? `${view.ramGb} ГБ` : "—"],
    ["Цвет", view.color ?? "—"],
    ["Состояние", conditionLabels[view.condition]],
    ["Аккумулятор", view.batteryHealth ? `${view.batteryHealth} %` : "—"],
    ["Город", view.city],
  ];

  return (
    <>
      {session?.user ? (
        <AppHeader email={session.user.email} items={memberNav} />
      ) : (
        <PublicHeader />
      )}

      <main id="main-content" className="mx-auto max-w-[1200px] px-6 py-8 md:px-10">
        <nav aria-label="Хлебные крошки" className="mb-4 text-13 text-text-dim">
          <Link href="/listings" className="hover:text-text">
            Каталог
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <Link href={`/listings/brand/${brandSlugs[view.brand]}`} className="hover:text-text">
            {brandLabels[view.brand]}
          </Link>
          {cityHub && (
            <>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <Link href={cityPath(cityHub)} className="hover:text-text">
                {cityHub.name}
              </Link>
            </>
          )}
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-text">{view.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-6">
            <PhotoGallery images={view.images} alt={view.title} />

            <div>
              <h1 className="text-28 font-semibold leading-tight">{view.title}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-3 text-13 text-text-dim">
                <span>{relativeDate(view.createdAt)}</span>
                {listing && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{listing.views} просмотров</span>
                  </>
                )}
                {listing?.isMine && status && (
                  <StatusPill tone={status.tone} label={status.label} />
                )}
              </p>
            </div>

            <section aria-labelledby="specs">
              <h2 id="specs" className="mb-3 text-18 font-semibold">
                Характеристики
              </h2>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                {specs.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-border py-2">
                    <dt className="text-13 text-text-dim">{label}</dt>
                    <dd className="text-13 text-text">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section aria-labelledby="description">
              <h2 id="description" className="mb-3 text-18 font-semibold">
                Описание
              </h2>
              <p className="whitespace-pre-line text-15 leading-relaxed text-text-dim">
                {view.description}
              </p>
            </section>
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-card border border-border bg-surface p-5">
              <p className="text-28 font-semibold">{formatTenge(view.price)}</p>
              {sold && (
                <p className="mt-2 text-13 text-text-dim">
                  Телефон продан — объявление осталось для истории.
                </p>
              )}

              <div className="mt-4 flex flex-col gap-3">
                {listing ? (
                  listing.isMine ? (
                    <Link href={`/listings/${listing.id}/edit`}>
                      <Button variant="secondary" fullWidth>
                        Редактировать
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <BuyButton
                        listingId={listing.id}
                        canRequest={listing.canRequest}
                        blockReason={listing.requestBlockReason}
                      />
                      <FavoriteButton listingId={listing.id} initial={listing.favorite} />
                    </>
                  )
                ) : (
                  <>
                    <Link href={`/login?next=${canonical}`}>
                      <Button variant="primary" fullWidth>
                        Войти и написать продавцу
                      </Button>
                    </Link>
                    <p className="text-center text-13 text-text-dim">
                      Телефон продавца открывается после входа и подтверждения заявки.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-card border border-border bg-surface p-5">
              <h2 className="mb-3 text-15 font-semibold">Продавец</h2>
              {listing ? (
                <>
                  <Link href={`/u/${listing.seller.id}`} className="flex items-center gap-3">
                    <Avatar src={listing.seller.avatarUrl} name={listing.seller.displayName} />
                    <div>
                      <p className="text-15 text-text">{listing.seller.displayName}</p>
                      <p className="text-13 text-text-dim">
                        {listing.seller.city ?? "—"} · {listing.seller.activeListings} объявл.
                      </p>
                    </div>
                  </Link>
                  {listing.seller.phone ? (
                    <a
                      href={`tel:${listing.seller.phone.replace(/[^+\d]/g, "")}`}
                      className="mt-4 block rounded-btn border border-accent px-4 py-2 text-center text-15 text-accent"
                    >
                      {listing.seller.phone}
                    </a>
                  ) : (
                    <p className="mt-4 text-13 text-text-dim">
                      Телефон продавца откроется, когда он примет вашу заявку.
                    </p>
                  )}
                </>
              ) : (
                <Link
                  href={`/u/${sellerId}`}
                  className="text-15 text-text hover:text-accent"
                >
                  {sellerName}
                </Link>
              )}
            </div>

            <p className="text-13 text-text-dim">
              Оплата проходит вне сайта. Встречайтесь в людном месте и проверяйте телефон
              до передачи денег.
            </p>
          </aside>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related" className="mt-12">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="related" className="text-22 font-semibold">
                Другие {brandLabels[view.brand]}
              </h2>
              <Link
                href={`/listings/brand/${brandSlugs[view.brand]}`}
                className="text-13 font-semibold text-accent underline underline-offset-2"
              >
                Все {brandLabels[view.brand]}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((l) => (
                <ListingCard key={l.id} listing={l} heart={!!session?.user} />
              ))}
            </div>
          </section>
        )}

        {/* Hub links from the money page: the model hub, the city hub and the buying
            checklist are exactly what a visitor (and a crawler) wants next. */}
        <nav aria-label="Похожие подборки" className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-13">
          <Link
            href={`/listings/model/${modelSlugOf(view)}`}
            className="text-accent underline underline-offset-2"
          >
            Все {brandLabels[view.brand]} {view.model} б/у
          </Link>
          {cityHub && (
            <Link href={cityPath(cityHub)} className="text-accent underline underline-offset-2">
              Телефоны {cityHub.in}
            </Link>
          )}
          {cityHub && (
            <Link
              href={`/listings/brand/${brandSlugs[view.brand]}/${cityHub.slug}`}
              className="text-accent underline underline-offset-2"
            >
              {brandLabels[view.brand]} {cityHub.in}
            </Link>
          )}
          <Link
            href="/guides/kak-proverit-telefon-pered-pokupkoy"
            className="text-accent underline underline-offset-2"
          >
            Как проверить телефон перед покупкой
          </Link>
        </nav>
      </main>

      <JsonLd
        data={[
          listingJsonLd(seo),
          breadcrumbJsonLd([
            { name: "Каталог", path: "/listings" },
            {
              name: brandLabels[view.brand],
              path: `/listings/brand/${brandSlugs[view.brand]}`,
            },
            { name: view.title, path: canonical },
          ]),
        ]}
      />
    </>
  );
}
