import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Menu,
  Sun,
  Moon,
  Monitor,
  Search,
  User,
  LogOut,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { Dropdown } from "../ui/Dropdown";
import { useTranslation } from "react-i18next";

export const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const { resolvedTheme, toggleTheme, setThemeMode, theme } = useTheme();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const userMenuItems = [
    { label: t("navigation.profile"), icon: User, href: "/settings" },
    { label: t("navigation.logout"), icon: LogOut, onClick: logout, destructive: true },
  ];

  const pageTitles = {
    "/dashboard": t("navigation.dashboard"),
    "/transactions": t("navigation.transactions"),
    "/budgets": t("navigation.budgets"),
    "/analytics": t("navigation.analytics"),
    "/savings": t("navigation.savingsGoals"),
    "/settings": t("navigation.settings"),
    "/security": t("navigation.security"),
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors lg:hidden"
            aria-label={t("navigation.openMenu")}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {pageTitles[location.pathname] || t("navigation.home")}
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
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              aria-label={t("common.search")}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label={
              theme === "system"
                ? t("theme.currentSystem")
                : resolvedTheme === "dark"
                  ? t("theme.switchLight")
                  : t("theme.switchDark")
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
              <Button variant="ghost" size="sm" className="gap-1 p-1">
                <Avatar
                  name={user?.name || t("common.user")}
                  src={user?.avatar}
                  size="sm"
                />
                <span className="hidden sm:block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {user?.name?.split(" ")[0] || t("common.user")}
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
