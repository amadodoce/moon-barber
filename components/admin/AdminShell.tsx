"use client";

import { useAdminSidebar } from "./AdminSidebarContext";
import { AdminHeader } from "./AdminHeader";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { sidebarWidth } = useAdminSidebar();

  return (
    <>
      <AdminHeader />
      <div className="flex">
        <div
          className="hidden shrink-0 transition-[width] duration-200 ease-in-out sm:block"
          style={{ width: sidebarWidth }}
          aria-hidden="true"
        />
        <main
          id="main-content"
          className="min-w-0 flex-1 px-[var(--space-sm)] py-[var(--space-md)] sm:px-[var(--space-md)] lg:px-[var(--space-lg)]"
        >
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </>
  );
}
