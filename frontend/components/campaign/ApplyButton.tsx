"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { applyToCampaign } from "@/app/campaigns/actions";

export function ApplyButton({
  campaignId,
  canApply,
  blockReason,
}: {
  campaignId: number;
  canApply: boolean;
  blockReason: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function apply() {
    setError(null);
    start(async () => {
      const res = await applyToCampaign(campaignId);
      if (!res.ok) setError(res.message ?? "Не получилось откликнуться");
      else router.refresh();
    });
  }

  if (!canApply) {
    return (
      <div>
        <Button variant="primary" fullWidth disabled>
          Откликнуться
        </Button>
        {blockReason && <p className="mt-2 text-center text-13 text-text-dim">{blockReason}</p>}
      </div>
    );
  }

  return (
    <div>
      <Button variant="primary" fullWidth loading={pending} onClick={apply}>
        Откликнуться
      </Button>
      {error && <p role="alert" className="mt-2 text-center text-13 text-error">{error}</p>}
    </div>
  );
}
