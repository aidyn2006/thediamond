import * as React from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, className, id, ...props }, ref) {
    const textareaId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-13 font-medium text-text-dim">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "min-h-24 w-full rounded-card border bg-surface-2 px-3.5 py-2.5 text-15 text-text",
            "placeholder:text-text-dim/70 transition-colors duration-150",
            error ? "border-error text-error" : "border-border",
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {error ? (
          <p className="text-13 text-error">{error}</p>
        ) : hint ? (
          <p className="text-13 text-text-dim">{hint}</p>
        ) : null}
      </div>
    );
  },
);
