import { cn } from "@/lib/cn";

function initials(name: string): string {
  const words = name.replace(/[«»"]/g, "").trim().split(/\s+/).filter(Boolean);
  const letters = words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

/** Circle placeholder with brand initials (design 2.4). */
export function BrandAvatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 font-semibold text-text-dim",
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}
