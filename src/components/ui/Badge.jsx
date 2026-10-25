import { getIcon } from "../../utils/icons";
import { forwardRef } from "react";

export const Badge = forwardRef(
  (
    {
      children,
      variant = "neutral",
      size = "md",
      className = "",
      dot = false,
      dotColor,
      ...props
    },
    ref,
  ) => {
    const variants = {
      success:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      warning:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      neutral:
        "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
      primary:
        "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400",
    };

    const sizes = {
      md: "px-2.5 py-0.5 text-xs",
      xs: "px-1.5 py-0 text-[10px]",
      sm: "px-2 py-0.5 text-xs",
      lg: "px-3 py-1 text-sm",
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {dot && (
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: dotColor || "currentColor" }}
          />
        )}
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";

export const StatusBadge = ({ status, className = "" }) => {
  const config = {
    good: { label: "On Track", variant: "success", icon: "CheckCircle2" },
    warning: { label: "Near Limit", variant: "warning", icon: "AlertTriangle" },
    over: { label: "Over Budget", variant: "danger", icon: "AlertCircle" },
    completed: { label: "Completed", variant: "success", icon: "CheckCircle2" },
    active: { label: "Active", variant: "info", icon: "Activity" },
    pending: { label: "Pending", variant: "warning", icon: "Clock" },
    cancelled: { label: "Cancelled", variant: "neutral", icon: "XCircle" },
  };

  const cfg = config[status] || config.pending;
  const Icon = cfg.icon ? getIcon(cfg.icon) : null;

  return (
    <Badge
      variant={cfg.variant}
      className={className}
      dot
      dotColor="currentColor"
    >
      {Icon && <Icon className="h-3 w-3" />}
      {cfg.label}
    </Badge>
  );
};
