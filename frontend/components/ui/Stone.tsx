import { cn } from "@/lib/cn";

/**
 * Signature #2 — faceted gem contour (lines only). Static by default;
 * `spin` slowly rotates it (landing hero). Reduced-motion disables the spin
 * globally via the CSS rule in globals.css.
 */
export function Stone({
  size = 160,
  spin = false,
  className,
}: {
  size?: number;
  spin?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      className={cn(spin && "animate-[spin_60s_linear_infinite]", className)}
      aria-hidden
    >
      {/* outline */}
      <path
        d="M60 50 H140 L165 82 L100 172 L35 82 Z"
        stroke="var(--color-border)"
        strokeWidth="1"
      />
      {/* girdle + table (accent edges) */}
      <path d="M35 82 H165" stroke="var(--color-accent)" strokeWidth="1" />
      <path d="M60 50 L35 82 M140 50 L165 82" stroke="var(--color-accent)" strokeWidth="1" />
      {/* crown facets */}
      <path
        d="M60 50 L78 82 M140 50 L122 82 M100 50 V82 M60 50 L100 50 M100 50 L140 50"
        stroke="var(--color-border)"
        strokeWidth="1"
      />
      {/* pavilion facets to culet */}
      <path
        d="M35 82 L100 172 M165 82 L100 172 M78 82 L100 172 M122 82 L100 172 M100 82 V172"
        stroke="var(--color-border)"
        strokeWidth="1"
      />
    </svg>
  );
}
