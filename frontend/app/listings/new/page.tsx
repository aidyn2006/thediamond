import { AppHeader } from "@/components/app/AppHeader";
import { ListingForm } from "@/components/listing/ListingForm";
import { requireMember } from "@/lib/guards";
import { memberNav } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Продать телефон",
  path: "/listings/new",
  index: false,
});

export default async function NewListingPage() {
  // requireMember (not requireSignedIn): buyers need a phone number on file before
  // they can post, otherwise nobody can reach them.
  const me = await requireMember();
  return (
    <>
      <AppHeader email={me.email} items={memberNav} />
      <main id="main-content">
        <ListingForm />
      </main>
    </>
  );
}
