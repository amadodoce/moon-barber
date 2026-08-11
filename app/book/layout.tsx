"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { StepIndicator } from "@/components/book/StepIndicator";

const stepRoutes = ["/book", "/book/barber", "/book/date-time", "/book/summary"];

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasHydrated = useBookingStore((s) => s._hasHydrated);
  const router = useRouter();
  const pathname = usePathname();
  const routeStep = Math.max(
    1,
    stepRoutes.findIndex((route) => route === pathname) + 1
  ) as 1 | 2 | 3 | 4;

  useEffect(() => {
    useBookingStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (routeStep >= 1) {
      useBookingStore.getState().setStep(routeStep);
    }
  }, [routeStep]);

  const showBackButton = hasHydrated && routeStep > 1;
  const isPaymentGateway = pathname === "/book/payment-gateway";

  return (
    <div className="min-h-screen min-h-dvh bg-[var(--color-paper)]">
      {!isPaymentGateway && (
        <header className="sticky top-0 z-10 border-b border-[var(--color-rule)] bg-[color-mix(in_oklch,var(--color-paper-2)_92%,transparent)] pt-[env(safe-area-inset-top)] backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-2xl items-center gap-[var(--space-xs)] px-[var(--space-sm)]">
            {showBackButton && (
              <button
                type="button"
                aria-label="بازگشت به مرحله قبل"
                onClick={() => {
                  useBookingStore.getState().setStep((routeStep - 1) as 1 | 2 | 3 | 4);
                  router.push(stepRoutes[routeStep - 2]);
                }}
                className="-mr-2 rounded-[var(--radius-input)] p-2 transition-colors duration-[var(--dur-short)] hover:bg-[var(--color-paper-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
              >
                <ArrowRight className="h-5 w-5 text-[var(--color-ink-2)]" />
              </button>
            )}
            <h1 className="text-[var(--text-lg)] font-semibold text-[var(--color-ink)]">
              رزرو نوبت
            </h1>
          </div>
          <div className="px-[var(--space-sm)] pb-[var(--space-xs)]">
            <StepIndicator />
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-60" />
        </header>
      )}

      <main
        id="main-content"
        className="mx-auto max-w-2xl px-[var(--space-sm)] py-[var(--space-md)]"
      >
        {children}
      </main>
    </div>
  );
}
