import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  Sun,
  Moon,
  Monitor,
  Bell,
  Search,
  User,
  Shield,
  LogOut,
  AlertTriangle,
  CreditCard,
  FileText,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { Dropdown } from "../ui/Dropdown";
import { Input } from "../ui/Input";

export const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const { resolvedTheme, toggleTheme, theme } = useTheme();
  const { user, logout, isDemoMode } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const userMenuItems = [
    { label: "Profile", icon: User, onClick: () => {}, href: "/settings" },
    { label: "Security", icon: Shield, onClick: () => {}, href: "/security" },
    {
      label:
        theme === "system"
          ? "System Theme"
          : resolvedTheme === "dark"
            ? "Light Mode"
            : "Dark Mode",
      icon: resolvedTheme === "dark" ? Sun : Moon,
      onClick: toggleTheme,
    },
    { label: "Demo Mode", icon: Monitor, disabled: true },
    { label: "Logout", icon: LogOut, onClick: logout, destructive: true },
  ];

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/transactions": "Transactions",
    "/budgets": "Budgets",
    "/analytics": "Analytics",
    "/savings": "Savings Goals",
    "/settings": "Settings",
    "/security": "Security",
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {pageTitles[location.pathname] || "Spend Analyzer"}
            </h1>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              aria-label="Search transactions"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label={
              theme === "system"
                ? "Current: System"
                : resolvedTheme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
            }
          >
            {theme === "system" ? (
              <Monitor className="h-5 w-5" />
            ) : resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <Dropdown
            trigger={
              <Button variant="ghost" size="sm" className="relative p-1">
                <Bell className="h-5 w-5 text-neutral-500" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
                  3
                </span>
              </Button>
            }
            items={[
              {
                label: "Budget alert: Food & Dining near limit",
                icon: AlertTriangle,
                onClick: () => {},
              },
              {
                label: "New transaction added: Grocery Shopping",
                icon: CreditCard,
                onClick: () => {},
              },
              {
                label: "Monthly report is ready",
                icon: FileText,
                onClick: () => {},
              },
              {
                label: "View all notifications",
                icon: Bell,
                onClick: () => {},
                className: "text-primary-600 font-medium",
              },
            ]}
          />

          <Dropdown
            trigger={
              <Button variant="ghost" size="sm" className="gap-1 p-1">
                <Avatar
                  name={user?.name || "User"}
                  src={user?.avatar}
                  size="sm"
                />
                <span className="hidden sm:block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {user?.name?.split(" ")[0] || "User"}
                </span>
              </Button>
            }
            items={userMenuItems}
          />
        </div>
      </div>
    </header>
  );
};
