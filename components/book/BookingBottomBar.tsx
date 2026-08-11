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
      <div className="pointer-events-none h-8 bg-gradient-to-t from-[var(--color-paper)] to-transparent" />
      <div className="border-t border-[var(--color-rule)] bg-[color-mix(in_oklch,var(--color-paper-2)_95%,transparent)] px-[var(--space-sm)] py-[var(--space-sm)] backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}

/** Reserve space so content is not hidden under the fixed bottom bar */
export const BOOKING_BOTTOM_BAR_PADDING = "pb-36";
