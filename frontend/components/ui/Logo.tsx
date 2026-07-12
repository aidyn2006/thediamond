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
}: {
  href?: string;
  className?: string;
  showText?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 text-text", className)}
      aria-label="TheDiamond"
    >
      <LogoMark size={26} className="text-accent" />
      {showText && (
        <span className="font-display text-17 font-semibold tracking-tight">
          TheDiamond
        </span>
      )}
    </Link>
  );
}
