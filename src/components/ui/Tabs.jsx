import { useState } from "react";
import { forwardRef } from "react";
import React from "react";

export const Tabs = ({
  children,
  defaultValue,
  value,
  onChange,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue || value);

  const handleTabChange = (tabValue) => {
    if (onChange) {
      onChange(tabValue);
    } else {
      setActiveTab(tabValue);
    }
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (child.type === TabList) {
          return React.cloneElement(child, {
            activeTab,
            onTabChange: handleTabChange,
          });
        }
        if (child.type === TabPanels) {
          return React.cloneElement(child, { activeTab });
        }
        return child;
      })}
    </div>
  );
};

const TabList = forwardRef(
  ({ children, activeTab, onTabChange, className = "" }, ref) => {
    return (
      <div
        ref={ref}
        role="tablist"
        className={`flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl ${className}`}
      >
        {React.Children.map(children, (child) => {
          if (child.type === TabTrigger) {
            return React.cloneElement(child, { activeTab, onTabChange });
          }
          return child;
        })}
      </div>
    );
  },
);

TabList.displayName = "TabList";

const TabTrigger = forwardRef(
  (
    {
      children,
      value,
      disabled = false,
      className = "",
      activeTab,
      onTabChange,
    },
    ref,
  ) => {
    const isActive = activeTab === value;

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${value}`}
        id={`tab-${value}`}
        onClick={() => !disabled && onTabChange(value)}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
          isActive
            ? "bg-white text-primary-600 shadow-sm dark:bg-neutral-700 dark:text-primary-400"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50 dark:text-neutral-400 dark:hover:text-neutral-100"
        } ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`}
      >
        {children}
      </button>
    );
  },
);

TabTrigger.displayName = "TabTrigger";

const TabPanels = ({ children, activeTab, className = "" }) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (child.type === TabPanel) {
          return React.cloneElement(child, { activeTab });
        }
        return child;
      })}
    </div>
  );
};

const TabPanel = forwardRef(
  ({ children, value, className = "", activeTab }, ref) => {
    if (activeTab !== value) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`panel-${value}`}
        aria-labelledby={`tab-${value}`}
        className={`animate-in ${className}`}
      >
        {children}
      </div>
    );
  },
);

TabPanel.displayName = "TabPanel";

Tabs.List = TabList;
Tabs.Trigger = TabTrigger;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

export { TabList as TabsList, TabTrigger as TabsTrigger, TabPanels as TabsPanels, TabPanel as TabsPanel };
