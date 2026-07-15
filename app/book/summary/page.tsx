"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CreditCard, Loader2 } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { createAppointment } from "@/app/actions/appointment";
import { initiatePayment } from "@/app/actions/payment";
import { BookingSummary } from "@/components/book/BookingSummary";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export default function SummaryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    serviceIds,
    date,
    startTime,
    barberId,
    notes,
    reset,
    setStep,
  } = useBookingStore();

  useEffect(() => {
    setStep(4);
  }, [setStep]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = serviceIds.length > 0 && date && startTime && barberId;

  const handlePayment = async () => {
    if (!canSubmit || loading) return;

    if (!session) {
      router.push("/login?callbackUrl=/book/summary");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const appointmentResult = await createAppointment({
        barberId,
        serviceIds,
        date,
        startTime,
        notes: notes || undefined,
      });

      if (!appointmentResult.success) {
        throw new Error(appointmentResult.error || "خطا در ایجاد نوبت");
      }

      const paymentResult = await initiatePayment({
        appointmentId: appointmentResult.data!.id,
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "خطا در ایجاد پرداخت");
      }

      reset();
      window.location.href = paymentResult.data!.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای داخلی سرور");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">خلاصه رزرو</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          اطلاعات رزرو خود را بررسی کنید
        </p>
      </div>

      <BookingSummary />

      {error && <ErrorMessage message={error} />}

      {/* Pay button */}
      <div className="sticky bottom-0 -mx-4 bg-white dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700 px-4 py-4">
        <button
          onClick={handlePayment}
          disabled={!canSubmit || loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              در حال پردازش...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              تأیید و پرداخت
            </>
          )}
        </button>
      </div>
    </div>
  );
}
