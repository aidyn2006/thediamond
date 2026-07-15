"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requestWithdraw } from "@/app/wallet/actions";

export function WithdrawForm({
  balance,
  min,
}: {
  balance: number;
  min: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [requisites, setRequisites] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();

  const canWithdraw = balance >= min;

  function submit() {
    setError(null);
    setOk(false);
    const value = Number(amount);
    if (!Number.isFinite(value) || value < min) {
      setError(`Минимальная сумма вывода — ${min} ₸`);
      return;
    }
    if (value > balance) {
      setError("Недостаточно средств на балансе");
      return;
    }
    if (!requisites.trim()) {
      setError("Укажите реквизиты (номер Kaspi/карты)");
      return;
    }
    start(async () => {
      const res = await requestWithdraw(value, requisites.trim());
      if (res.ok) {
        setOk(true);
        setAmount("");
        setRequisites("");
        router.refresh();
      } else {
        setError(res.message ?? "Не получилось создать заявку");
      }
    });
  }

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <p className="text-15 font-semibold">Вывод средств</p>
      <p className="mt-1 text-13 text-text-dim">
        Минимальная сумма вывода — {min.toLocaleString("ru-RU")} ₸. Заявку обработает администратор.
      </p>

      {!canWithdraw ? (
        <p className="mt-4 text-13 text-text-dim">
          Накопите от {min.toLocaleString("ru-RU")} ₸, чтобы вывести средства.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <Input
            label="Сумма, ₸"
            name="amount"
            inputMode="numeric"
            placeholder={String(min)}
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          />
          <Input
            label="Реквизиты (Kaspi / карта)"
            name="requisites"
            placeholder="+7 700 000 00 00"
            value={requisites}
            onChange={(e) => setRequisites(e.target.value)}
          />
          {error && <p className="text-13 text-error">{error}</p>}
          {ok && <p className="text-13 text-success">Заявка создана — деньги удержаны до выплаты.</p>}
          <Button type="button" variant="primary" fullWidth loading={pending} onClick={submit}>
            Вывести
          </Button>
        </div>
      )}
      {!canWithdraw && error && <p className="mt-3 text-13 text-error">{error}</p>}
    </div>
  );
}
