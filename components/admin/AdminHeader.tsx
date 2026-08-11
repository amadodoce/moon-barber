"use client";

import { Menu } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { Sidebar } from "./Sidebar";
import { useAdminSidebar } from "./AdminSidebarContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AdminHeader() {
  const { sidebarWidth, mobileOpen, setMobileOpen } = useAdminSidebar();

  return (
    <>
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-[var(--space-sm)] border-b border-[var(--color-rule)] bg-[color-mix(in_oklch,var(--color-paper-2)_85%,transparent)] px-[var(--space-sm)] pt-[env(safe-area-inset-top)] backdrop-blur-sm sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-[var(--radius-input)] p-2 text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-paper-3)]"
          aria-label="باز کردن منو"
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <BrandMark size="sm" asLink={false} />
      </header>

      {/* Desktop sidebar (fixed, RTL right) */}
      <aside
        data-admin-sidebar
        className="hidden sm:fixed sm:inset-y-0 sm:right-0 sm:z-20 sm:flex sm:flex-col sm:overflow-hidden sm:transition-[width] sm:duration-200 sm:ease-in-out"
        style={{ width: sidebarWidth }}
        aria-label="نوار کناری مدیریت"
      >
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          id="admin-mobile-sidebar"
          side="right"
          showCloseButton={false}
          className="w-64 max-w-[85vw] gap-0 p-0 pr-[env(safe-area-inset-right)] sm:hidden"
        >
          <Sidebar mobile />
        </SheetContent>
      </Sheet>
    </>
  );
}
