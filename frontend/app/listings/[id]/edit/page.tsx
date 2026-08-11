import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app/AppHeader";
import { ListingForm } from "@/components/listing/ListingForm";
import { requireMember } from "@/lib/guards";
import { apiFetch } from "@/lib/api";
import { memberNav } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";
import type { ListingDetail } from "@/lib/api-types";

export const metadata = pageMetadata({
  title: "Редактировать объявление",
  index: false,
});

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireMember();
  const { id } = await params;

  const res = await apiFetch(`/api/listings/${id}`);
  if (!res.ok) notFound();
  const listing: ListingDetail = await res.json();
  // The detail endpoint hides other people's unpublished listings, but an ACTIVE one
  // is visible to everyone — so ownership still has to be checked here.
  if (!listing.isMine) notFound();

  return (
    <>
      <AppHeader email={me.email} items={memberNav} />
      <main id="main-content">
        <ListingForm initial={listing} />
      </main>
    </>
  );
}
