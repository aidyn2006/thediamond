import Link from "next/link";
import { cn } from "@/lib/cn";
import { BrandAvatar } from "@/components/ui/BrandAvatar";
import { StatusPill } from "@/components/ui/StatusPill";
import { PlatformPills } from "./PlatformPills";
import { formatTenge } from "@/lib/categories";
import { applicationStatusPill, type ApplicationStatus } from "@/lib/status";
import type { CampaignFeedItem } from "@/lib/api-types";

export function CampaignCard({ item }: { item: CampaignFeedItem }) {
  const { campaign: c, myApplicationStatus } = item;
  const applied = myApplicationStatus != null;
  const pill = applied ? applicationStatusPill[myApplicationStatus as ApplicationStatus] : null;

  return (
    <Link
      href={`/campaigns/${c.id}`}
      className={cn(
        "group flex flex-col gap-3 rounded-card border border-border bg-surface p-4 transition-colors duration-150 hover:border-accent hover:bg-surface-2",
        applied && "opacity-70",
      )}
    >
      <div className="flex items-center gap-2">
        <BrandAvatar name={c.brandName} />
        <div className="min-w-0">
          <p className="truncate text-13 text-text-dim">{c.brandName}</p>
        </div>
        {pill && <StatusPill tone={pill.tone} label={pill.label} className="ml-auto" />}
      </div>

      <h3 className="text-17 font-semibold leading-snug">{c.title}</h3>

      <PlatformPills platforms={c.platforms} />

      <div className="mt-auto flex items-end justify-between pt-2">
        <span className="tabular text-22 font-semibold">{formatTenge(c.rewardPerCreator)}</span>
        <span className="text-right text-13 text-text-dim">
          осталось {c.slotsLeft} мест
          <br />
          до {c.deadline}
        </span>
      </div>
    </Link>
  );
}
