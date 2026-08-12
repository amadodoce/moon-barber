"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CreditCard, Loader2 } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { useBookingGuard } from "@/hooks/useBookingGuard";
import { createAppointment } from "@/app/actions/appointment";
import { initiatePayment } from "@/app/actions/payment";
import { BookingSummary } from "@/components/book/BookingSummary";
import { PageHeader } from "@/components/brand/PageHeader";
import { Button } from "@/components/ui/button";
import { showError } from "@/lib/toast";
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
  } = useBookingStore();

  useBookingGuard(4);

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSubmit = serviceIds.length > 0 && date && startTime && barberId;

  const handlePayment = async () => {
    if (!canSubmit || loading) return;

    if (!session) {
      router.push("/login?callbackUrl=/book/summary");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const appointmentResult = await createAppointment({
        barberId,
        serviceIds,
        date,
        startTime,
        notes: notes || undefined,
      });

      if (!appointmentResult.success) {
        const msg = appointmentResult.error || "خطا در ایجاد نوبت";
        setSubmitError(msg);
        showError(msg);
        setLoading(false);
        return;
      }

      const paymentResult = await initiatePayment({
        appointmentId: appointmentResult.data!.id,
      });

      if (!paymentResult.success) {
        const msg = paymentResult.error || "خطا در ایجاد پرداخت";
        setSubmitError(msg);
        showError(msg);
        setLoading(false);
        return;
      }

      window.location.href = paymentResult.data!.paymentUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "خطای داخلی سرور";
      setSubmitError(msg);
      showError(msg);
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-[var(--space-md)] ${canSubmit ? BOOKING_BOTTOM_BAR_PADDING : ""}`}>
      <PageHeader
        eyebrow="مرحله ۴ از ۴"
        title="تأیید و پرداخت"
        description="جزئیات نوبت را بررسی کنید و برای پرداخت ادامه دهید."
      />

      <BookingSummary />

      {submitError && (
        <div className="rounded-[var(--radius-input)] border border-[var(--status-failed-border)] bg-[var(--status-failed-bg)] p-[var(--space-sm)] text-sm text-[var(--status-failed-fg)]">
          <p>{submitError}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setSubmitError(null)}
          >
            بستن
          </Button>
        </div>
      )}

      {canSubmit && (
        <BookingBottomBar>
          <Button
            variant="brand"
            className="w-full gap-2"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                در حال پردازش…
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                تأیید و پرداخت
              </>
            )}
          </Button>
        </BookingBottomBar>
      )}
    </div>
  );
}
