import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Signature #1 — the TheDiamond wordmark. The capital "D" carries the prism
 * gradient (faceted glyph). Kept in the display font, used sparingly.
 */
export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "font-display text-17 font-semibold tracking-tight text-text",
        className,
      )}
      aria-label="TheDiamond"
    >
      The<span className="text-prism">D</span>iamond
    </Link>
  );
}
