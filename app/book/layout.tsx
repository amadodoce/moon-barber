"use client";

import { useBookingStore } from "@/stores/booking";
import { StepIndicator } from "@/components/book/StepIndicator";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const stepRoutes = ["/book", "/book/date-time", "/book/barber", "/book/summary"];

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const step = useBookingStore((s) => s.step);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-zinc-100">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          {step > 1 && (
            <button
              onClick={() => {
                useBookingStore.getState().setStep((step - 1) as 1 | 2 | 3 | 4);
                router.push(stepRoutes[step - 2]);
              }}
              className="p-2 -mr-2 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <ArrowRight className="h-5 w-5 text-zinc-600" />
            </button>
          )}
          <h1 className="text-lg font-bold text-zinc-900">رزرو نوبت</h1>
        </div>
        <div className="px-4 pb-3">
          <StepIndicator />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
