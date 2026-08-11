import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-[var(--space-md)]",
        className
      )}
    >
      <p className="text-xs text-[var(--color-ink-muted)]">{label}</p>
      <p className="mt-1 text-[var(--text-xl)] font-semibold text-[var(--color-ink)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-[var(--color-ink-faint)]">{hint}</p>
      ) : null}
    </div>
  );
}
