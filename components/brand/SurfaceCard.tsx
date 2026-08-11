import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SurfaceCardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  as?: "div" | "article" | "section";
}

const paddingMap = {
  none: "",
  sm: "p-[var(--space-sm)]",
  md: "p-[var(--space-md)]",
  lg: "p-[var(--space-lg)]",
};

export function SurfaceCard({
  children,
  className,
  padding = "md",
  as: Tag = "div",
}: SurfaceCardProps) {
  return (
    <Tag
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-2)]",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </Tag>
  );
}
