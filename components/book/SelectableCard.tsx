"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SelectableCardProps {
  selected?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  meta?: ReactNode;
  badge?: string;
  className?: string;
}

export function SelectableCard({
  selected,
  disabled,
  onSelect,
  title,
  description,
  meta,
  badge,
  className,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "w-full rounded-[var(--radius-card)] border p-[var(--space-md)] text-start transition-[border-color,background-color,transform] duration-[var(--dur-short)]",
        "min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]",
        selected
          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
          : "border-[var(--color-rule)] bg-[var(--color-paper-2)] hover:border-[color-mix(in_oklch,var(--color-accent)_40%,var(--color-rule))]",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-[var(--color-ink)]">{title}</p>
          {description ? (
            <p className="text-sm text-[var(--color-ink-muted)]">{description}</p>
          ) : null}
          {meta ? (
            <div className="pt-1 text-xs text-[var(--color-ink-2)]">{meta}</div>
          ) : null}
        </div>
        {badge ? (
          <span className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-paper-3)] px-2 py-0.5 text-xs text-[var(--color-accent)]">
            {badge}
          </span>
        ) : null}
      </div>
    </button>
  );
}
