import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8" role="main">
          <Outlet />
        </main>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Sidebar
            isCollapsed={false}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>
      )}
    </div>
  );
};
