import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-[var(--space-sm)] rounded-[var(--radius-card)] border border-dashed border-[var(--color-rule)] bg-[var(--color-paper-2)] px-[var(--space-md)] py-[var(--space-xl)] text-center",
        className
      )}
    >
      {icon ? (
        <div className="text-[var(--color-ink-muted)]" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <div className="space-y-1">
        <p className="text-[var(--text-md)] font-medium text-[var(--color-ink)]">
          {title}
        </p>
        {description ? (
          <p className="max-w-sm text-sm text-[var(--color-ink-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        action.href ? (
          <Button variant="outline" render={<Link href={action.href} />}>
            {action.label}
          </Button>
        ) : (
          <Button variant="outline" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      ) : null}
    </div>
  );
}
