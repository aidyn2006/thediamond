import * as React from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

const base =
  "inline-flex items-center justify-center gap-2 rounded-btn font-semibold " +
  "transition-[filter,background-color,border-color,color] duration-150 " +
  "disabled:cursor-not-allowed disabled:opacity-60 select-none";

export type ButtonSize = "md" | "sm";

/**
 * Size lives here rather than in a caller's className: `cn` is plain clsx, so a
 * caller passing `px-3` next to the base `px-5` loses — Tailwind resolves the clash
 * by stylesheet order, not by class order.
 *
 * `sm` is for dense rows on a phone (the public header); it grows back to the normal
 * size from the `sm` breakpoint up.
 */
const sizeClasses: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-15",
  sm: "h-10 px-3 text-13 sm:h-11 sm:px-5 sm:text-15",
};

export const variantClasses: Record<ButtonVariant, string> = {
  // signature prism button — exactly one per screen (design 2.3). The mint fill is
  // light, so the label is ink rather than the page background.
  primary: "bg-prism text-text hover:brightness-105",
  secondary: "bg-surface-2 border border-border text-text hover:border-accent",
  ghost: "bg-transparent text-accent hover:bg-surface-2",
  destructive: "bg-transparent border border-error text-error hover:bg-error/10",
};

/** Class string for links that should look like a button. */
export function buttonClasses(
  variant: ButtonVariant = "secondary",
  fullWidth = false,
  size: ButtonSize = "md",
) {
  return cn(base, sizeClasses[size], variantClasses[variant], fullWidth && "w-full");
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        base,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
