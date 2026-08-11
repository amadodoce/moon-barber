import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  asLink?: boolean;
}

const sizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function BrandMark({
  className,
  size = "md",
  asLink = true,
}: BrandMarkProps) {
  const content = (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-semibold tracking-tight",
        sizeMap[size],
        className
      )}
    >
      <span className="text-[var(--color-ink)]">مون</span>
      <span className="text-[var(--color-accent)]">باربر</span>
    </span>
  );

  if (asLink) {
    return (
      <Link href="/" className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)] rounded-sm">
        {content}
      </Link>
    );
  }

  return content;
}
