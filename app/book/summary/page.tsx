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
import {
  BookingBottomBar,
  BOOKING_BOTTOM_BAR_PADDING,
} from "@/components/book/BookingBottomBar";

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
    <div className={`space-y-6 ${canSubmit ? BOOKING_BOTTOM_BAR_PADDING : ""}`}>
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">خلاصه رزرو</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          اطلاعات رزرو خود را بررسی کنید
        </p>
      </div>

      <BookingSummary />

      {canSubmit && (
        <BookingBottomBar>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}
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
        </BookingBottomBar>
      )}
    </div>
  );
}
