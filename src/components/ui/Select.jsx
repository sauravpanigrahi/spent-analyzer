import { forwardRef } from "react";

export const Select = forwardRef(
  (
    {
      label,
      leftIcon,
      error,
      helperText,
      options = [],
      placeholder,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </span>
          )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            `${errorId || ""} ${helperId || ""}`.trim() || undefined
          }
          className={`${leftIcon ? "pl-10 " : ""}w-full rounded-xl border px-4 py-2.5 text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-neutral-300 focus:border-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-primary-400"
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        </div>
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
