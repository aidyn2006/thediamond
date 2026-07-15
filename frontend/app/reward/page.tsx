import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth, requireApprovedRole } from "@/lib/guards";
import { apiFetch } from "@/lib/api";
import { Logo } from "@/components/ui/Logo";
import { SocialProofForm } from "@/components/onboarding/SocialProofForm";
import type { SocialProofState } from "@/lib/api-types";

/**
 * First-task screen shown right after registration (creators are sent here on
 * successful email verification). Prominent reward CTA: post in Threads → 1000₸.
 * Non-blocking — "Позже" continues to the campaigns feed.
 */
export default async function RewardPage() {
  const session = await requireAuth();
  const role = session.user.role;
  if (role !== "CREATOR") redirect("/");
  await requireApprovedRole("CREATOR");

  const pr = await apiFetch("/api/creator/social-proof");
  if (!pr.ok) redirect("/pending");
  const proofState = (await pr.json()) as SocialProofState;

  return (
    <main className="flex min-h-dvh flex-col items-center px-6 py-12">
      <Logo className="mb-8" />

      <div className="w-full max-w-[560px]">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-13 font-semibold text-bg">
            Первое задание · +1000 ₸
          </span>
          <h1 className="mt-4 text-28 font-semibold">Расскажите о TheDiamond</h1>
          <p className="mx-auto mt-2 max-w-[44ch] text-15 text-text-dim">
            Напишите пост в&nbsp;Threads о&nbsp;нашем сервисе с вашим кодом — и мы
            начислим <span className="text-text">1000&nbsp;₸</span> на кошелёк.
            Instagram или TikTok — 500&nbsp;₸. Награда выдаётся один раз.
          </p>
        </div>

        <div className="flex justify-center">
          <SocialProofForm state={proofState} />
        </div>

        <div className="mt-8 text-center">
          <Link href="/campaigns" className="text-15 text-text-dim hover:text-accent">
            Позже — перейти к кампаниям
          </Link>
        </div>
      </div>
    </main>
  );
}
