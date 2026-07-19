"use client";

import { useState } from "react";
import { Scissors, Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

export function AdminHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/80 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-800/80 sm:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          aria-label="باز کردن منو"
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
      <div className="hidden sm:block sm:w-64" />
    </>
  );
}
