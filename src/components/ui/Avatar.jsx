import { forwardRef } from "react";
import { User } from "lucide-react";

export const Avatar = forwardRef(
  ({ src, name, size = "md", className = "", ...props }, ref) => {
    const sizes = {
      xs: "h-6 w-6 text-xs",
      sm: "h-8 w-8 text-sm",
      md: "h-10 w-10 text-base",
      lg: "h-12 w-12 text-lg",
      xl: "h-16 w-16 text-xl",
    };

    const getInitials = (name) => {
      if (!name) return "?";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const initials = getInitials(name);

    const colorIndex = name ? name.charCodeAt(0) % 10 : 0;
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-green-500",
      "bg-emerald-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-violet-500",
    ];
    const bgColor = colors[colorIndex];

    return (
      <div
        ref={ref}
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ${sizes[size]} ${className}`}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={name || "Avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={`${bgColor} h-full w-full flex items-center justify-center`}
          >
            <span className="text-white font-medium">{initials}</span>
          </div>
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";

export const AvatarGroup = ({
  children,
  max = 5,
  className = "",
  ...props
}) => {
  const kids = React.Children.toArray(children);
  const visible = kids.slice(0, max);
  const remaining = kids.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`} {...props}>
      {visible.map((child, index) => (
        <div key={index} className="relative z-[calc(100-_index)]">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="relative z-0 flex items-center justify-center rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium">
          +{remaining}
        </div>
      )}
    </div>
  );
};

import React from "react";
