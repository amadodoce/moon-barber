"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/brand";

interface AdminRouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export function AdminRouteError({
  error,
  reset,
  title = "خطا در بارگذاری",
}: AdminRouteErrorProps) {
  return (
    <div className="space-y-[var(--space-md)]">
      <PageHeader title={title} />
      <div className="flex flex-col items-center gap-[var(--space-sm)] rounded-[var(--radius-card)] border border-dashed border-[var(--color-rule)] bg-[var(--color-paper-2)] px-[var(--space-md)] py-[var(--space-xl)] text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--status-failed-bg)" }}
        >
          <AlertTriangle
            className="h-7 w-7"
            style={{ color: "var(--status-failed-fg)" }}
          />
        </div>
        <p className="text-[var(--text-sm)] text-[var(--color-ink-2)]">
          {error.message || "متأسفانه در پردازش درخواست خطایی پیش آمده است."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-[var(--space-2xs)]">
          <Button
            onClick={reset}
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-accent-ink)",
            }}
          >
            تلاش مجدد
          </Button>
          <Button variant="outline" render={<Link href="/admin" />}>
            بازگشت به داشبورد
          </Button>
        </div>
      </div>
    </div>
  );
}
