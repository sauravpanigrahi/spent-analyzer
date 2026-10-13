import { forwardRef } from "react";

export const Card = forwardRef(
  (
    { children, className = "", hover = false, padding = "p-6", ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-card ${hover ? "hover:shadow-card-hover transition-shadow duration-200" : ""} ${padding} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

export const CardHeader = forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={`mb-4 ${className}`} {...props}>
        {children}
      </div>
    );
  },
);

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`text-lg font-semibold text-neutral-900 dark:text-neutral-100 ${className}`}
        {...props}
      >
        {children}
      </h3>
    );
  },
);

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`mt-1 text-sm text-neutral-500 dark:text-neutral-400 ${className}`}
        {...props}
      >
        {children}
      </p>
    );
  },
);

CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  },
);

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardFooter.displayName = "CardFooter";
