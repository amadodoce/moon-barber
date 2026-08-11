import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-[var(--space-sm)] sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-[var(--space-2xs)]">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-ink)]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-prose text-[var(--text-sm)] text-[var(--color-ink-2)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-[var(--space-2xs)]">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
