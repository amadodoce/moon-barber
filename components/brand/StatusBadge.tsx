import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  bgVar?: string;
  fgVar?: string;
  className?: string;
}

export function StatusBadge({
  label,
  bgVar = "var(--color-paper-3)",
  fgVar = "var(--color-ink-2)",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      style={{ backgroundColor: bgVar, color: fgVar }}
    >
      {label}
    </span>
  );
}
