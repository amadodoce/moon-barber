"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";

interface DashboardShellProps {
  title: string;
  greeting?: string;
  cta?: { label: string; href: string };
  children: ReactNode;
}

export function DashboardShell({
  title,
  greeting,
  cta,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen min-h-dvh bg-[var(--color-paper)]">
      <header className="sticky top-0 z-10 border-b border-[var(--color-rule)] bg-[color-mix(in_oklch,var(--color-paper-2)_90%,transparent)] pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-[var(--space-sm)]">
          <div className="flex items-center gap-3">
            <BrandMark size="sm" />
            <span className="text-sm font-medium text-[var(--color-ink-muted)]">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {cta ? (
              <Button variant="brand" size="sm" render={<Link href={cta.href} />}>
                {cta.label}
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              aria-label="خروج از حساب"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-[var(--space-sm)] py-[var(--space-md)]">
        {greeting ? (
          <p className="mb-[var(--space-md)] text-sm text-[var(--color-ink-muted)]">
            {greeting}
          </p>
        ) : null}
        {children}
      </main>
    </div>
  );
}
