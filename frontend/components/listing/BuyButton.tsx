"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { requestDeal } from "@/app/deals/actions";

/**
 * Purchase request. Money never moves here — accepting exchanges phone numbers,
 * which is why the copy promises contacts rather than a checkout.
 */
export function BuyButton({
  listingId,
  canRequest,
  blockReason,
}: {
  listingId: number;
  canRequest: boolean;
  blockReason: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  function send() {
    setError(null);
    start(async () => {
      const res = await requestDeal(listingId, message);
      if (!res.ok) setError(res.message ?? "Не получилось отправить заявку");
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (!canRequest) {
    return (
      <div>
        <Button variant="primary" fullWidth disabled>
          Хочу купить
        </Button>
        {blockReason && (
          <p className="mt-2 text-center text-13 text-text-dim">{blockReason}</p>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <div>
        <Button variant="primary" fullWidth onClick={() => setOpen(true)}>
          Хочу купить
        </Button>
        <p className="mt-2 text-center text-13 text-text-dim">
          Продавец увидит заявку и откроет вам свой телефон
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        label="Сообщение продавцу"
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={1000}
        placeholder="Здравствуйте! Готов забрать сегодня, когда удобно посмотреть?"
      />
      <Button variant="primary" fullWidth loading={pending} onClick={send}>
        Отправить заявку
      </Button>
      <Button variant="ghost" fullWidth onClick={() => setOpen(false)}>
        Отмена
      </Button>
      {error && (
        <p role="alert" className="text-center text-13 text-error">
          {error}
        </p>
      )}
    </div>
  );
}
