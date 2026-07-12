import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/guards";
import { apiFetch, getCurrentUser } from "@/lib/api";
import { AppHeader } from "@/components/app/AppHeader";
import { CreatorProfileEditor } from "@/components/profile/CreatorProfileEditor";
import { BrandProfileEditor } from "@/components/profile/BrandProfileEditor";
import type {
  CreatorProfileResponse,
  BrandProfileResponse,
} from "@/lib/api-types";

export default async function ProfilePage() {
  const session = await requireAuth();
  const role = session.user.role;
  if (role === "ADMIN") redirect("/admin");

  const me = await getCurrentUser();
  if (!me?.onboardingComplete) redirect("/onboarding");

  const path = role === "CREATOR" ? "/api/creator/me" : "/api/brand/me";
  const res = await apiFetch(path);
  if (!res.ok) redirect("/onboarding");
  const profile = await res.json();

  return (
    <>
      <AppHeader email={session.user.email} />
      {role === "CREATOR" ? (
        <CreatorProfileEditor initial={profile as CreatorProfileResponse} />
      ) : (
        <BrandProfileEditor initial={profile as BrandProfileResponse} />
      )}
    </>
  );
}
