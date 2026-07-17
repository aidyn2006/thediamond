import * as React from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-btn px-5 text-15 font-semibold " +
  "transition-[filter,background-color,border-color,color] duration-150 " +
  "disabled:cursor-not-allowed disabled:opacity-60 select-none";

export const variantClasses: Record<ButtonVariant, string> = {
  // signature prism button — exactly one per screen (design 2.3)
  primary: "bg-prism text-bg hover:brightness-110",
  secondary: "bg-surface-2 border border-border text-text hover:border-accent",
  ghost: "bg-transparent text-accent hover:bg-surface-2",
  destructive: "bg-transparent border border-error text-error hover:bg-error/10",
};

/** Class string for links that should look like a button. */
export function buttonClasses(variant: ButtonVariant = "secondary", fullWidth = false) {
  return cn(base, variantClasses[variant], fullWidth && "w-full");
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "secondary",
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variantClasses[variant], fullWidth && "w-full", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
