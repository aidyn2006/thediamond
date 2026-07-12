import { cn } from "@/lib/cn";

/**
 * Brand mark: monoline "D" with an inscribed faceted diamond.
 * Uses currentColor so it adapts to the surface it sits on.
 */
export function LogoMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth={9}
      strokeLinejoin="round"
      strokeLinecap="round"
      className={cn(className)}
      aria-hidden
    >
      {/* the "D" */}
      <path d="M32 24 H62 C96 24 96 96 62 96 H32 Z" />
      {/* inscribed diamond gem */}
      <path d="M46 48 H74 L78 58 L60 88 L42 58 Z" />
      <path d="M42 58 H78" />
    </svg>
  );
}
