import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app/AppHeader";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { requireAuth } from "@/lib/guards";
import { getCurrentUser } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Знакомство",
  path: "/onboarding",
  index: false,
});

export default async function OnboardingPage() {
  const session = await requireAuth();
  if (session.user.role === "ADMIN") redirect("/admin");

  const me = await getCurrentUser();
  // Already filled in — nothing to onboard.
  if (me?.onboardingComplete) redirect("/listings");

  return (
    <>
      <AppHeader email={session.user.email} home="/listings" />
      <main id="main-content">
        <ProfileEditor mode="onboarding" />
      </main>
    </>
  );
}
