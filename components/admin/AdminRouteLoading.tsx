import { PageHeader } from "@/components/brand";
import { Skeleton, SkeletonCard } from "@/components/brand/Skeleton";

interface AdminRouteLoadingProps {
  title?: string;
  variant?: "table" | "cards" | "form";
}

export function AdminRouteLoading({
  title = "در حال بارگذاری…",
  variant = "table",
}: AdminRouteLoadingProps) {
  return (
    <div className="space-y-[var(--space-md)]">
      <PageHeader title={title} />
      {variant === "table" ? (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
          <div className="space-y-0 border-b border-[var(--color-rule)] p-[var(--space-sm)]">
            <Skeleton className="h-9 w-full max-w-md" />
          </div>
          <div className="space-y-2 p-[var(--space-sm)]">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      ) : variant === "cards" ? (
        <div className="grid grid-cols-1 gap-[var(--space-sm)] sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[var(--space-md)] lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
