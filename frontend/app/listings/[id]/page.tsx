import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app/AppHeader";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PhotoGallery } from "@/components/listing/PhotoGallery";
import { BuyButton } from "@/components/listing/BuyButton";
import { FavoriteButton } from "@/components/listing/FavoriteButton";
import { JsonLd } from "@/components/JsonLd";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { apiFetch, getPublicListing } from "@/lib/api";
import { memberNav } from "@/lib/nav";
import { absoluteImage, absoluteUrl, pageMetadata } from "@/lib/seo";
import { listingStatusPill } from "@/lib/status";
import {
  brandLabels,
  conditionLabels,
  formatTenge,
  relativeDate,
  storageLabel,
} from "@/lib/phones";
import type { ListingDetail, PublicListing } from "@/lib/api-types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getPublicListing(id);
  if (!listing) return pageMetadata({ title: "Объявление не найдено", index: false });
  return pageMetadata({
    title: `${listing.title} — ${formatTenge(listing.price)}, ${listing.city}`,
    description: listing.description.slice(0, 300),
    path: `/listings/${id}`,
    ogType: "article",
  });
}

/** Google's Product/Offer schema — this is what earns the price snippet in search. */
function productJsonLd(listing: PublicListing) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    brand: { "@type": "Brand", name: brandLabels[listing.brand] },
    image: listing.images.map((src) => absoluteImage(src)).filter(Boolean),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "KZT",
      itemCondition:
        listing.condition === "NEW"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/listings/${listing.id}`),
      seller: { "@type": "Person", name: listing.sellerName },
    },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

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
                    <Link href={`/login?next=/listings/${id}`}>
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
                  href={`/u/${publicListing!.sellerId}`}
                  className="text-15 text-text hover:text-accent"
                >
                  {publicListing!.sellerName}
                </Link>
              )}
            </div>

            <p className="text-13 text-text-dim">
              Оплата проходит вне сайта. Встречайтесь в людном месте и проверяйте телефон
              до передачи денег.
            </p>
          </aside>
        </div>
      </main>

      {publicListing && <JsonLd data={productJsonLd(publicListing)} />}
    </>
  );
}
