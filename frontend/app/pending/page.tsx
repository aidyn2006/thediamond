import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/guards";
import { getCurrentUser } from "@/lib/api";
import { roleHome } from "@/lib/types";
import { signOut } from "@/auth";
import { Stone } from "@/components/ui/Stone";
import { Button } from "@/components/ui/Button";
import { EmailVerifyForm } from "@/components/auth/EmailVerifyForm";

export default async function PendingPage() {
  const session = await requireAuth();
  const role = session.user.role;
  if (role === "ADMIN") redirect("/admin");

  const me = await getCurrentUser();
  if (!me?.onboardingComplete) redirect("/onboarding");
  if (me.approved) redirect(roleHome(role));

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center">
      <Stone size={140} className="mb-8 opacity-80" />
      <h1 className="text-22 font-semibold">Подтвердите почту</h1>
      <p className="mt-3 mb-8 max-w-[46ch] text-15 text-text-dim">
        Мы отправим код на вашу почту. После подтверждения профиль откроется
        автоматически — модерация не потребуется.
      </p>

      <EmailVerifyForm email={me.email} home={roleHome(role)} />

      {role === "CREATOR" && (
        <p className="mt-6 max-w-[46ch] text-13 text-text-dim">
          После входа выполните первое задание в разделе «Кошелёк» — напишите пост
          в&nbsp;Threads о&nbsp;TheDiamond и получите 1000&nbsp;₸ (или 500&nbsp;₸ за
          Instagram/TikTok).
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
