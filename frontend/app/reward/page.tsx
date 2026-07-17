import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/guards";
import { apiFetch, getCurrentUser } from "@/lib/api";
import { Logo } from "@/components/ui/Logo";
import { SocialProofForm } from "@/components/onboarding/SocialProofForm";
import type { SocialProofState } from "@/lib/api-types";

/**
 * Advertise-task screen. Creators are sent here after email verification and on
 * every login until the task is done (see requireApprovedRole). This page does its
 * OWN gating (not requireApprovedRole) to avoid a redirect loop. Post in Threads → 1000₸.
 */
export default async function RewardPage() {
  const session = await requireAuth();
  const role = session.user.role;
  if (role !== "CREATOR") redirect("/");

  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (!me.onboardingComplete) redirect("/onboarding");
  if (!me.approved) redirect("/pending");
  // Already done → no reason to nag; send them into the app.
  if (me.rewardTaskDone) redirect("/campaigns");

  const pr = await apiFetch("/api/creator/social-proof");
  if (!pr.ok) redirect("/pending");
  const proofState = (await pr.json()) as SocialProofState;

  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-dvh flex-col items-center px-6 py-12">
      <Logo className="mb-8" />

      <div className="w-full max-w-[560px]">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-13 font-semibold text-bg">
            Первое задание · +1000 ₸
          </span>
          <h1 className="mt-4 text-28 font-semibold">Расскажите о TheDiamond</h1>
          <p className="mx-auto mt-2 max-w-[44ch] text-15 text-text-dim">
            Скопируйте готовый текст, опубликуйте его в&nbsp;Threads и отправьте
            ссылку — мы начислим <span className="text-text">1000&nbsp;₸</span> на
            кошелёк. Награда выдаётся один раз.
          </p>
        </div>

        <div className="flex justify-center">
          <SocialProofForm state={proofState} />
        </div>
      </div>
    </main>
  );
}
