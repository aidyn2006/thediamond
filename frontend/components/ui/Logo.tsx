import Link from "next/link";
import { cn } from "@/lib/cn";
import { LogoMark } from "./LogoMark";

/**
 * Signature #1 — the TheDiamond logo: brand mark (monoline D + gem) + wordmark.
 */
export function Logo({
  href = "/",
  className,
  showText = true,
  compact = false,
}: {
  href?: string;
  className?: string;
  showText?: boolean;
  /**
   * Drops the wordmark below 400px, leaving the mark alone. Only for rows that also
   * carry buttons — on a 360px screen the wordmark and two CTAs cannot both fit, and
   * an overflowing header scrolls the whole page sideways.
   */
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex shrink-0 items-center gap-2 text-text", className)}
      aria-label="TheDiamond"
    >
      <LogoMark size={26} className="text-accent" />
      {showText && (
        <span
          className={cn(
            "font-display text-17 font-semibold tracking-tight",
            compact && "hidden min-[400px]:inline",
          )}
        >
          TheDiamond
        </span>
      )}
    </Link>
  );
}
