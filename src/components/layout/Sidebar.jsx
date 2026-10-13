import { useState } from "react";
import { Link, useLocation, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Target,
  BarChart3,
  PiggyBank,
  Settings,
  Shield,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { Dropdown } from "../ui/Dropdown";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Budgets", href: "/budgets", icon: Target },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Savings Goals", href: "/savings", icon: PiggyBank },
];

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Security", href: "/security", icon: Shield },
];

export const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const { user, logout, isDemoMode } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const userMenuItems = [
    { label: "Profile", icon: User, onClick: () => {}, href: "/settings" },
    { label: "Security", icon: Shield, onClick: () => {}, href: "/security" },
    {
      label: "Theme",
      icon: resolvedTheme === "dark" ? Sun : Moon,
      onClick: toggleTheme,
    },
    { label: "Demo Mode", icon: Monitor, disabled: true },
    { label: "Logout", icon: LogOut, onClick: logout, destructive: true },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      aria-label="Main navigation"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
          {!isCollapsed && (
            <Link
              to="/dashboard"
              className="flex items-center gap-2"
              aria-label="Spend Analyzer Home"
            >
              <div className="h-8 w-8 rounded-xl bg-primary-600 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                Spend Analyzer
              </span>
            </Link>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto p-3 space-y-1"
          role="navigation"
          aria-label="Main"
        >
          <div className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Main
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
                title={isCollapsed ? item.name : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        <nav className="p-3 space-y-1" role="navigation" aria-label="Settings">
          <div className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Settings
          </div>
          {bottomNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
                title={isCollapsed ? item.name : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar
                name={user?.name || "User"}
                src={user?.avatar}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {isDemoMode ? "Demo Mode" : user?.email}
                </p>
              </div>
              <Dropdown
                trigger={
                  <Button variant="ghost" size="sm" className="p-1">
                    <Bell className="h-4 w-4" />
                  </Button>
                }
                items={userMenuItems}
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <Avatar
                name={user?.name || "User"}
                src={user?.avatar}
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
