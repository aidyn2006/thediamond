import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/guards";
import { apiFetch, getCurrentUser } from "@/lib/api";
import { roleHome } from "@/lib/types";
import { signOut } from "@/auth";
import { Stone } from "@/components/ui/Stone";
import { Button } from "@/components/ui/Button";
import { SocialProofForm } from "@/components/onboarding/SocialProofForm";
import type { SocialProofState } from "@/lib/api-types";

async function loadSocialProofState(): Promise<SocialProofState | null> {
  const res = await apiFetch("/api/creator/social-proof");
  if (!res.ok) return null;
  return (await res.json()) as SocialProofState;
}

export default async function PendingPage() {
  const session = await requireAuth();
  const role = session.user.role;
  if (role === "ADMIN") redirect("/admin");

  const me = await getCurrentUser();
  if (!me?.onboardingComplete) redirect("/onboarding");
  if (me.approved) redirect(roleHome(role));

  const socialProofState = role === "CREATOR" ? await loadSocialProofState() : null;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center">
      <Stone size={140} className="mb-8 opacity-80" />
      <h1 className="text-22 font-semibold">
        {role === "CREATOR" ? "Подтвердите публикацию" : "Профиль на проверке"}
      </h1>

      {role === "CREATOR" ? (
        <>
          <p className="mt-3 mb-8 max-w-[48ch] text-15 text-text-dim">
            Опубликуйте короткий пост, TikTok или тред о TheDiamond и добавьте персональный код. Так мы понимаем, что профиль принадлежит вам.
          </p>
          {socialProofState && <SocialProofForm state={socialProofState} />}
        </>
      ) : (
        <p className="mt-3 max-w-[42ch] text-15 text-text-dim">
          Обычно проверяем за один рабочий день. Как только одобрим - откроем доступ и пришлем письмо.
        </p>
      )}

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-8"
      >
        <Button variant="ghost" type="submit">
          Выйти
        </Button>
      </form>
    </main>
  );
}
