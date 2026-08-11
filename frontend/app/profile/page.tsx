import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app/AppHeader";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { requireAuth } from "@/lib/guards";
import { apiFetch, getCurrentUser } from "@/lib/api";
import { memberNav } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";
import type { ProfileResponse } from "@/lib/api-types";

export const metadata = pageMetadata({ title: "Профиль", path: "/profile", index: false });

export default async function ProfilePage() {
  const session = await requireAuth();
  if (session.user.role === "ADMIN") redirect("/admin");

  const me = await getCurrentUser();
  if (!me?.onboardingComplete) redirect("/onboarding");

  const res = await apiFetch("/api/profile/me");
  if (!res.ok) redirect("/onboarding");
  const profile = (await res.json()) as ProfileResponse;

  return (
    <>
      <AppHeader email={session.user.email} items={memberNav} />
      <main id="main-content">
        <ProfileEditor initial={profile} />
      </main>
    </>
  );
}
