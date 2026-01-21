import { forwardRef, type InputHTMLAttributes } from "react";

/**
 * Input component with consistent styling.
 */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2
            border rounded-lg
            bg-[var(--background)]
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
            disabled:opacity-50 disabled:cursor-not-allowed
            read-only:opacity-50 read-only:cursor-not-allowed
            ${error ? "border-red-500 focus:ring-red-500" : "border-[var(--border)]"}
            ${className}
          `}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1 text-xs text-[var(--muted-foreground)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
