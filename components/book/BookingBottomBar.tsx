"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BookingBottomBarProps {
  children: ReactNode;
  className?: string;
}

export function BookingBottomBar({ children, className }: BookingBottomBarProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 mx-auto max-w-2xl pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      <div className="h-8 bg-gradient-to-t from-zinc-50 dark:from-zinc-900 to-transparent pointer-events-none" />
      <div className="border-t border-zinc-100 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800">
        {children}
      </div>
    </div>
  );
}

/** Reserve space so content is not hidden under the fixed bottom bar */
export const BOOKING_BOTTOM_BAR_PADDING = "pb-36";
