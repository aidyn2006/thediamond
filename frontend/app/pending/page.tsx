import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/guards";
import { getCurrentUser } from "@/lib/api";
import { roleHome } from "@/lib/types";
import { signOut } from "@/auth";
import { Stone } from "@/components/ui/Stone";
import { Button } from "@/components/ui/Button";

export default async function PendingPage() {
  const session = await requireAuth();
  const role = session.user.role;
  if (role === "ADMIN") redirect("/admin");

  const me = await getCurrentUser();
  if (!me?.onboardingComplete) redirect("/onboarding");
  if (me.approved) redirect(roleHome(role));

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Stone size={140} className="mb-8 opacity-80" />
      <h1 className="text-22 font-semibold">Профиль на проверке</h1>
      <p className="mt-3 max-w-[42ch] text-15 text-text-dim">
        Обычно проверяем за один рабочий день. Как только одобрим — откроем
        доступ и пришлём письмо.
      </p>
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
