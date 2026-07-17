import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { formatNumber, categoryLabels } from "@/lib/categories";
import type { PublicCreatorProfile } from "@/lib/api-types";

/** Catalog card for a public creator — links to the indexable profile /u/[id]. */
export function PublicCreatorCard({ creator }: { creator: PublicCreatorProfile }) {
  return (
    <Link
      href={`/u/${creator.id}`}
      className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 transition-colors duration-150 hover:border-accent hover:bg-surface-2"
    >
      <div className="flex items-center gap-3">
        <Avatar name={creator.name} src={creator.avatarUrl} size={56} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{creator.name}</p>
          <p className="text-13 text-text-dim">{creator.city}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {creator.categories.slice(0, 3).map((cat) => (
          <span key={cat} className="rounded-pill border border-border px-2 py-0.5 text-13 text-text-dim">
            {categoryLabels[cat]}
          </span>
        ))}
      </div>
      <p className="tabular text-13 text-text-dim">
        {formatNumber(creator.totalFollowers)} подписчиков
      </p>
    </Link>
  );
}
