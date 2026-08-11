import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import type { ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function FormField({
  id,
  label,
  children,
  hint,
  error,
  required,
  className,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-[var(--color-ink-2)]">
        {label}
        {required ? (
          <span className="text-[var(--color-accent)]" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </Label>
      <div
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
      >
        {children}
      </div>
      {hint ? (
        <p id={hintId} className="text-xs text-[var(--color-ink-muted)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-[var(--status-cancelled-fg)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
