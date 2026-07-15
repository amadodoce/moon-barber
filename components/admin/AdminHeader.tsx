"use client";

import { useState } from "react";
import Link from "next/link";
import { Scissors, Menu, X } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Sidebar } from "./Sidebar";

export function AdminHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useCurrentUser();

  return (
    <>
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm px-4 sm:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg"
        >
          <Menu className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
            <Scissors className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">پنل مدیریت</span>
        </div>
      </header>

      {/* Desktop sidebar (fixed) */}
      <aside className="hidden sm:fixed sm:inset-y-0 sm:right-0 sm:z-20 sm:flex sm:w-64 sm:flex-col">
        <Sidebar />
      </aside>

      {/* Mobile sidebar (slide-out) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-64">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Spacer for desktop sidebar */}
      <div className="hidden sm:block sm:w-64" />
    </>
  );
}
