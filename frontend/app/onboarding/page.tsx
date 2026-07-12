import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/guards";
import { getCurrentUser } from "@/lib/api";
import { roleHome } from "@/lib/types";
import { CreatorOnboarding } from "@/components/onboarding/CreatorOnboarding";
import { BrandOnboarding } from "@/components/onboarding/BrandOnboarding";

export default async function OnboardingPage() {
  const session = await requireAuth();
  const role = session.user.role;
  if (role === "ADMIN") redirect("/admin");

  const me = await getCurrentUser();
  if (me?.onboardingComplete) {
    redirect(me.approved ? roleHome(role) : "/pending");
  }

  return role === "CREATOR" ? <CreatorOnboarding /> : <BrandOnboarding />;
}
