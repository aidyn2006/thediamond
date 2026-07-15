import { redirect } from "next/navigation";
import { requireAuth, requireApprovedRole } from "@/lib/guards";
import { apiFetch } from "@/lib/api";
import { AppHeader } from "@/components/app/AppHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { WithdrawForm } from "@/components/wallet/WithdrawForm";
import { SocialProofForm } from "@/components/onboarding/SocialProofForm";
import { creatorNav, brandNav } from "@/lib/nav";
import type {
  WalletResponse,
  WalletTransactionType,
  WithdrawalStatus,
  SocialProofState,
} from "@/lib/api-types";

const txLabel: Record<WalletTransactionType, string> = {
  REWARD: "Награда",
  CAMPAIGN_PAYOUT: "Оплата кампании",
  WITHDRAWAL: "Вывод средств",
  REFUND: "Возврат",
  ADJUSTMENT: "Корректировка",
};

const wdStatus: Record<WithdrawalStatus, { label: string; tone: "success" | "warning" | "error" }> = {
  PENDING: { label: "В обработке", tone: "warning" },
  PAID: { label: "Выплачено", tone: "success" },
  REJECTED: { label: "Отклонено", tone: "error" },
};

function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export default async function WalletPage() {
  const session = await requireAuth();
  const role = session.user.role;
  if (role === "ADMIN") redirect("/admin");
  await requireApprovedRole(role as "CREATOR" | "BRAND");

  const res = await apiFetch("/api/wallet");
  if (!res.ok) redirect("/pending");
  const wallet = (await res.json()) as WalletResponse;

  let proofState: SocialProofState | null = null;
  if (role === "CREATOR") {
    const pr = await apiFetch("/api/creator/social-proof");
    if (pr.ok) proofState = (await pr.json()) as SocialProofState;
  }

  const nav = role === "CREATOR" ? creatorNav : brandNav;

  return (
    <>
      <AppHeader email={session.user.email} items={nav} />
      <main className="mx-auto max-w-[1200px] px-6 py-8 md:px-10">
        <h1 className="mb-6 text-28 font-semibold">Кошелёк</h1>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-6">
            {/* Balance */}
            <div className="rounded-card border border-border bg-surface p-6">
              <p className="text-13 text-text-dim">Баланс</p>
              <p className="mt-1 font-display text-40 font-semibold tabular">{fmt(wallet.balance)} ₸</p>
            </div>

            {/* Transactions */}
            <div className="rounded-card border border-border bg-surface p-5">
              <p className="mb-3 text-15 font-semibold">История операций</p>
              {wallet.transactions.length === 0 ? (
                <p className="py-4 text-13 text-text-dim">Операций пока нет.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {wallet.transactions.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="text-15">{txLabel[t.type]}</p>
                        {t.description && (
                          <p className="truncate text-13 text-text-dim">{t.description}</p>
                        )}
                      </div>
                      <span
                        className={
                          "shrink-0 tabular text-15 font-semibold " +
                          (t.amount >= 0 ? "text-success" : "text-text")
                        }
                      >
                        {t.amount >= 0 ? "+" : ""}
                        {fmt(t.amount)} ₸
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Withdrawal history */}
            {wallet.withdrawals.length > 0 && (
              <div className="rounded-card border border-border bg-surface p-5">
                <p className="mb-3 text-15 font-semibold">Заявки на вывод</p>
                <ul className="divide-y divide-border">
                  {wallet.withdrawals.map((w) => (
                    <li key={w.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="text-15 tabular">{fmt(w.amount)} ₸</p>
                        <p className="truncate text-13 text-text-dim">{w.requisites}</p>
                        {w.rejectReason && (
                          <p className="text-13 text-error">{w.rejectReason}</p>
                        )}
                      </div>
                      <StatusPill tone={wdStatus[w.status].tone} label={wdStatus[w.status].label} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <WithdrawForm balance={wallet.balance} min={wallet.minWithdrawal} />

            {/* First task: advertise TheDiamond — 1000₸ for Threads, 500₸ otherwise (creators only) */}
            {role === "CREATOR" && proofState && (
              <div className="rounded-card border border-border bg-surface p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-15 font-semibold">Задание: расскажите о нас</p>
                  <span className="rounded-full bg-prism px-2.5 py-1 text-13 font-semibold text-bg">
                    до +1000 ₸
                  </span>
                </div>
                <p className="mb-4 text-13 text-text-dim">
                  Напишите пост в Threads о TheDiamond и получите 1000&nbsp;₸ (или
                  500&nbsp;₸ за Instagram/TikTok) — награда зачислится после проверки.
                </p>
                <SocialProofForm state={proofState} />
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
