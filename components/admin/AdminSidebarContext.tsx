"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const SIDEBAR_WIDTH = 256;
export const SIDEBAR_COLLAPSED_WIDTH = 72;

function readSidebarExpanded(): boolean {
  if (typeof window === "undefined") return true;
  const saved = localStorage.getItem("admin-sidebar-expanded");
  return saved !== null ? saved === "true" : true;
}

interface AdminSidebarContextValue {
  expanded: boolean;
  toggleExpanded: () => void;
  sidebarWidth: number;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextValue | null>(null);

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(readSidebarExpanded);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem("admin-sidebar-expanded", String(next));
      return next;
    });
  }, []);

  const sidebarWidth = expanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  const value = useMemo(
    () => ({
      expanded,
      toggleExpanded,
      sidebarWidth,
      mobileOpen,
      setMobileOpen,
    }),
    [expanded, toggleExpanded, sidebarWidth, mobileOpen]
  );

  return (
    <AdminSidebarContext.Provider value={value}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const ctx = useContext(AdminSidebarContext);
  if (!ctx) {
    throw new Error("useAdminSidebar must be used within AdminSidebarProvider");
  }
  return ctx;
}
