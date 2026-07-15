"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CreditCard, Loader2 } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { createAppointment } from "@/app/actions/appointment";
import { initiatePayment } from "@/app/actions/payment";
import { BookingSummary } from "@/components/book/BookingSummary";
import { showSuccess, showError } from "@/lib/toast";

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

  const canSubmit = serviceIds.length > 0 && date && startTime && barberId;

  const handlePayment = async () => {
    if (!canSubmit || loading) return;

    if (!session) {
      router.push("/login?callbackUrl=/book/summary");
      return;
    }

    setLoading(true);

    try {
      const appointmentResult = await createAppointment({
        barberId,
        serviceIds,
        date,
        startTime,
        notes: notes || undefined,
      });

      if (!appointmentResult.success) {
        showError(appointmentResult.error || "خطا در ایجاد نوبت");
        setLoading(false);
        return;
      }

      showSuccess("نوبت با موفقیت ایجاد شد");

      const paymentResult = await initiatePayment({
        appointmentId: appointmentResult.data!.id,
      });

      if (!paymentResult.success) {
        showError(paymentResult.error || "خطا در ایجاد پرداخت");
        setLoading(false);
        return;
      }

      reset();
      window.location.href = paymentResult.data!.paymentUrl;
    } catch (err) {
      showError(err instanceof Error ? err.message : "خطای داخلی سرور");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="animate-[fade-in-up_0.4s_ease-out_both]">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">خلاصه رزرو</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          اطلاعات رزرو خود را بررسی کنید
        </p>
      </div>

      <BookingSummary />

      {/* Pay button */}
      {canSubmit && (
        <div className="sticky bottom-0 -mx-4 px-4">
          <div className="h-8 bg-gradient-to-t from-white dark:from-zinc-800 to-transparent pointer-events-none" />
          <div className="bg-white dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700 px-4 py-4">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4A853] px-4 py-3 text-sm font-semibold text-white hover:bg-[#C49A48] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D4A853]/20"
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
      )}
    </div>
  );
}
