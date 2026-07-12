import { platformLabels, type Platform } from "@/lib/categories";

/** Text platform pills — no brand logos (design 2.4). */
export function PlatformPills({ platforms }: { platforms: Platform[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {platforms.map((p) => (
        <span
          key={p}
          className="rounded-pill border border-border px-2 py-0.5 text-13 text-text-dim"
        >
          {platformLabels[p]}
        </span>
      ))}
    </div>
  );
}
