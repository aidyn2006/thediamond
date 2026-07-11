import { cn } from "@/lib/cn";

export type StatusTone = "success" | "warning" | "error" | "accent" | "dim";

const toneClasses: Record<StatusTone, string> = {
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  error: "bg-error/12 text-error",
  accent: "bg-accent/12 text-accent",
  dim: "bg-text-dim/12 text-text-dim",
};

const dotClasses: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  accent: "bg-accent",
  dim: "bg-text-dim",
};

/** Unified status pill (design 2.4): 6px dot + text, colour at 12% as bg. */
export function StatusPill({
  tone,
  label,
  className,
}: {
  tone: StatusTone;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-13 font-medium",
        toneClasses[tone],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClasses[tone])} />
      {label}
    </span>
  );
}
