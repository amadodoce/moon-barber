"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { CreditCard, Loader2, X, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/brand/SurfaceCard";

function MockGateway() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const authority = searchParams.get("Authority");

  if (!authority) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-[var(--space-sm)]">
        <SurfaceCard className="w-full max-w-sm space-y-[var(--space-md)] text-center" padding="lg">
          <AlertTriangle className="mx-auto h-10 w-10 text-[var(--status-pending-fg)]" aria-hidden="true" />
          <h1 className="text-[var(--text-lg)] font-semibold text-[var(--color-ink)]">
            نشست پرداخت نامعتبر
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)]">
            کد authority یافت نشد. لطفاً از ابتدا رزرو را تکرار کنید.
          </p>
          <Button variant="brand" className="w-full" render={<Link href="/book/summary" />}>
            بازگشت به خلاصه رزرو
          </Button>
        </SurfaceCard>
      </div>
    );
  }

  const callbackBase = `${window.location.origin}/api/payment/callback`;

  const handlePay = () => {
    router.push(
      `${callbackBase}?Authority=${encodeURIComponent(authority)}&Status=OK`
    );
  };

  const handleCancel = () => {
    router.push(
      `${callbackBase}?Authority=${encodeURIComponent(authority)}&Status=NOK`
    );
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-[var(--space-sm)]">
      <SurfaceCard className="w-full max-w-sm space-y-[var(--space-md)]" padding="lg">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-input)] bg-[var(--color-accent)]">
            <CreditCard className="h-6 w-6 text-[var(--color-accent-ink)]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-[var(--text-lg)] font-semibold text-[var(--color-ink)]">
              درگاه پرداخت
            </h1>
            <p className="text-xs text-[var(--color-ink-muted)]">Zarinpal Sandbox (Mock)</p>
          </div>
        </div>

        <div className="space-y-2 rounded-[var(--radius-input)] bg-[var(--color-paper-3)] p-[var(--space-sm)]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-ink-muted)]">Authority</span>
            <span className="max-w-[12rem] truncate font-mono text-xs text-[var(--color-ink-2)]" dir="ltr">
              {authority}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-ink-muted)]">وضعیت</span>
            <span className="font-medium text-[var(--color-accent)]">در انتظار پرداخت</span>
          </div>
        </div>

        <div className="space-y-[var(--space-xs)]">
          <Button
            variant="brand"
            className="w-full bg-[var(--status-confirmed-fg)] hover:bg-[color-mix(in_oklch,var(--status-confirmed-fg)_85%,black)]"
            onClick={handlePay}
          >
            پرداخت موفق
          </Button>
          <Button variant="outline" className="w-full gap-2" onClick={handleCancel}>
            <X className="h-4 w-4" aria-hidden="true" />
            لغو پرداخت
          </Button>
        </div>
      </SurfaceCard>
    </div>
  );
}

export default function PaymentGatewayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" aria-hidden="true" />
        </div>
      }
    >
      <MockGateway />
    </Suspense>
  );
}
