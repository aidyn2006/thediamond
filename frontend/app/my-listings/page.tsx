import Link from "next/link";
import { AppHeader } from "@/components/app/AppHeader";
import { ListingCard } from "@/components/listing/ListingCard";
import { ListingActions } from "@/components/listing/ListingActions";
import { Button } from "@/components/ui/Button";
import { requireSignedIn } from "@/lib/guards";
import { apiFetch } from "@/lib/api";
import { memberNav } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";
import type { MyListingItem } from "@/lib/api-types";

export const metadata = pageMetadata({
  title: "Мои объявления",
  path: "/my-listings",
  index: false,
});

export default async function MyListingsPage() {
  const me = await requireSignedIn();
  const res = await apiFetch("/api/listings/mine");
  const items: MyListingItem[] = res.ok ? await res.json() : [];

  return (
    <>
      <AppHeader email={me.email} items={memberNav} />
      <main id="main-content" className="mx-auto max-w-[1200px] px-6 py-8 md:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-28 font-semibold">Мои объявления</h1>
          <Link href="/listings/new">
            <Button variant="primary">Продать телефон</Button>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-8 text-center">
            <p className="text-15 text-text">У вас пока нет объявлений</p>
            <p className="mt-2 text-13 text-text-dim">
              Опишите телефон, добавьте фото — и мы опубликуем объявление после проверки.
            </p>
            <Link href="/listings/new" className="mt-4 inline-block">
              <Button variant="primary">Создать объявление</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.listing.id} className="flex flex-col gap-2">
                <ListingCard listing={item.listing} showStatus />

                {item.rejectReason && (
                  <p className="rounded-btn border border-error/40 px-3 py-2 text-13 text-error">
                    Причина отказа: {item.rejectReason}
                  </p>
                )}

                <p className="text-13 text-text-dim">
                  {item.dealRequests > 0
                    ? `${item.dealRequests} заявок ждут ответа`
                    : "Заявок пока нет"}
                  {item.favorites > 0 && ` · ${item.favorites} в избранном`}
                </p>

                <ListingActions
                  listingId={item.listing.id}
                  status={item.listing.status}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
