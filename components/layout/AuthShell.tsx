import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";
import { SurfaceCard } from "@/components/brand/SurfaceCard";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-screen min-h-dvh flex-col bg-[var(--color-paper)]">
      <header className="border-b border-[var(--color-rule)] px-[var(--space-md)] py-[var(--space-sm)] pt-[calc(var(--space-sm)+env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <BrandMark size="sm" />
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)]"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            صفحه اصلی
          </Link>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-[var(--space-md)] py-[var(--space-xl)]"
      >
        <SurfaceCard padding="lg" className="animate-[fade-in-up_var(--dur-medium)_var(--ease-out)]">
          <div className="mb-[var(--space-md)] space-y-1">
            <h1 className="text-[var(--text-xl)] font-semibold text-[var(--color-ink)]">
              {title}
            </h1>
            <p className="text-sm text-[var(--color-ink-muted)]">{description}</p>
          </div>
          {children}
        </SurfaceCard>
        {footer}
      </main>
    </div>
  );
}
