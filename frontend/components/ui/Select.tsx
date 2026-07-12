import * as React from "react";
import { cn } from "@/lib/cn";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, error, className, id, children, ...props }, ref) {
    const selectId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-13 font-medium text-text-dim">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-11 w-full rounded-card border bg-surface-2 px-3.5 text-15 text-text",
            "transition-colors duration-150",
            error ? "border-error" : "border-border",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-13 text-error">{error}</p>}
      </div>
    );
  },
);
