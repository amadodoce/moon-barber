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

  return (
    <div className="min-h-screen min-h-dvh bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-800/80">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          {showBackButton && (
            <button
              type="button"
              aria-label="بازگشت به مرحله قبل"
              onClick={() => {
                useBookingStore.getState().setStep((routeStep - 1) as 1 | 2 | 3 | 4);
                router.push(stepRoutes[routeStep - 2]);
              }}
              className="p-2 -mr-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <ArrowRight className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </button>
          )}
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">رزرو نوبت</h1>
        </div>
        <div className="px-4 pb-3">
          <StepIndicator />
        </div>
        {/* Gold accent line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--booking-gold)] to-transparent" />
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div>{children}</div>
      </main>
    </div>
  );
}
