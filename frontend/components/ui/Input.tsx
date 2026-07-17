import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, hint, className, id, ...props }, ref) {
    const inputId = id ?? props.name;
    const msgId = inputId ? `${inputId}-msg` : undefined;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-13 font-medium text-text-dim">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-card border bg-surface-2 px-3.5 text-15 text-text",
            "placeholder:text-text-dim/70 transition-colors duration-150",
            error ? "border-error text-error" : "border-border",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={(error || hint) && msgId ? msgId : undefined}
          {...props}
        />
        {error ? (
          <p id={msgId} className="text-13 text-error">{error}</p>
        ) : hint ? (
          <p id={msgId} className="text-13 text-text-dim">{hint}</p>
        ) : null}
      </div>
    );
  },
);
