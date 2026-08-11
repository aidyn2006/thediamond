import Link from "next/link";
import { AppHeader } from "@/components/app/AppHeader";
import { ListingCard } from "@/components/listing/ListingCard";
import { Button } from "@/components/ui/Button";
import { requireSignedIn } from "@/lib/guards";
import { apiFetch } from "@/lib/api";
import { memberNav } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";
import type { ListingSummary } from "@/lib/api-types";

export const metadata = pageMetadata({
  title: "Избранное",
  path: "/favorites",
  index: false,
});

export default async function FavoritesPage() {
  const me = await requireSignedIn();
  const res = await apiFetch("/api/favorites");
  const listings: ListingSummary[] = res.ok ? await res.json() : [];

  return (
    <>
      <AppHeader email={me.email} items={memberNav} />
      <main id="main-content" className="mx-auto max-w-[1200px] px-6 py-8 md:px-10">
        <h1 className="mb-6 text-28 font-semibold">Избранное</h1>

        {listings.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-8 text-center">
            <p className="text-15 text-text">Пока пусто</p>
            <p className="mt-2 text-13 text-text-dim">
              Нажимайте «В избранное» на объявлениях, чтобы не потерять их.
            </p>
            <Link href="/listings" className="mt-4 inline-block">
              <Button variant="primary">В каталог</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {listings.map((l) => (
              // Everything here is already a favourite, so the heart starts filled and
              // doubles as the "remove" control.
              <ListingCard key={l.id} listing={l} showStatus heart favorite />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
