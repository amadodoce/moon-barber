"use client";

import { useState, useEffect } from "react";
import { Scissors, Menu } from "lucide-react";
import { Sidebar, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "./Sidebar";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

export function AdminHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-expanded");
    if (saved !== null) setSidebarExpanded(saved === "true");

    const observer = new MutationObserver(() => {
      const sidebar = document.querySelector("[data-admin-sidebar]");
      if (sidebar) {
        const w = sidebar.getBoundingClientRect().width;
        setSidebarExpanded(w > SIDEBAR_COLLAPSED_WIDTH + 20);
      }
    });

    const target = document.querySelector("[data-admin-sidebar]");
    if (target) {
      observer.observe(target, { attributes: true, attributeFilter: ["style"] });
    }

    return () => observer.disconnect();
  }, []);

  const sidebarWidth = sidebarExpanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <>
      {/* Mobile header */}
      <header
        className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4 pt-[env(safe-area-inset-top)] backdrop-blur-sm sm:hidden"
        style={{
          borderColor: "var(--surface-border)",
          backgroundColor: "color-mix(in srgb, var(--surface-overlay) 80%, transparent)",
        }}
      >
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 transition-colors hover:bg-[var(--surface-border)]"
          aria-label="باز کردن منو"
        >
          <Menu className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--booking-gold)" }}
          >
            <Scissors className="h-4 w-4" style={{ color: "var(--surface-base)" }} />
          </div>
          <span className="font-bold" style={{ color: "var(--text-primary)" }}>پنل مدیریت</span>
        </div>
      </header>

      {/* Desktop sidebar (fixed) */}
      <aside
        data-admin-sidebar
        className="hidden sm:fixed sm:inset-y-0 sm:right-0 sm:z-20 sm:flex sm:flex-col sm:transition-[width] sm:duration-200"
        style={{ width: sidebarWidth }}
      >
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-64 max-w-[85vw] gap-0 p-0 pr-[env(safe-area-inset-right)] sm:hidden"
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Spacer for desktop sidebar */}
      <div
        className="hidden sm:block sm:transition-[width] sm:duration-200"
        style={{ width: sidebarWidth }}
      />
    </>
  );
}
