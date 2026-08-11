import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app/AppHeader";
import { PublicHeader } from "@/components/public/PublicHeader";
import { ListingCard } from "@/components/listing/ListingCard";
import { JsonLd } from "@/components/JsonLd";
import { Avatar } from "@/components/ui/Avatar";
import { getPublicSeller } from "@/lib/api";
import { memberNav } from "@/lib/nav";
import { absoluteImage, absoluteUrl, pageMetadata } from "@/lib/seo";
import type { PublicSeller } from "@/lib/api-types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const seller = await getPublicSeller(id);
  if (!seller) return pageMetadata({ title: "Продавец не найден", index: false });
  return pageMetadata({
    title: `${seller.displayName} — объявления`,
    description:
      seller.about?.slice(0, 300) ??
      `Телефоны от ${seller.displayName}${seller.city ? `, ${seller.city}` : ""}: ${seller.listings.length} активных объявлений.`,
    path: `/u/${id}`,
    ogType: "profile",
  });
}

function personJsonLd(seller: PublicSeller) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: seller.displayName,
    image: absoluteImage(seller.avatarUrl),
    address: seller.city
      ? { "@type": "PostalAddress", addressLocality: seller.city }
      : undefined,
    url: absoluteUrl(`/u/${seller.id}`),
  };
}

export default async function SellerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const seller = await getPublicSeller(id);
  if (!seller) notFound();

  const since = new Date(seller.memberSince).toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {session?.user ? (
        <AppHeader email={session.user.email} items={memberNav} />
      ) : (
        <PublicHeader />
      )}

      <main id="main-content" className="mx-auto max-w-[1200px] px-6 py-8 md:px-10">
        <header className="mb-8 flex flex-wrap items-center gap-4">
          <Avatar src={seller.avatarUrl} name={seller.displayName} size={72} />
          <div>
            <h1 className="text-28 font-semibold">{seller.displayName}</h1>
            <p className="mt-1 text-13 text-text-dim">
              {[seller.city, `на сайте с ${since}`].filter(Boolean).join(" · ")}
            </p>
          </div>
        </header>

        {seller.about && (
          <p className="mb-8 max-w-[640px] whitespace-pre-line text-15 leading-relaxed text-text-dim">
            {seller.about}
          </p>
        )}

        <h2 className="mb-4 text-18 font-semibold">
          Объявления
          <span className="ml-2 text-13 font-normal text-text-dim">
            {seller.listings.length}
          </span>
        </h2>

        {seller.listings.length === 0 ? (
          <p className="rounded-card border border-border bg-surface p-6 text-13 text-text-dim">
            У продавца сейчас нет активных объявлений.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {seller.listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </main>

      <JsonLd data={personJsonLd(seller)} />
    </>
  );
}
