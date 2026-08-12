"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { useBookingGuard } from "@/hooks/useBookingGuard";
import { getAvailableBookingSlots } from "@/app/actions/appointment";
import { DatePicker } from "@/components/book/DatePicker";
import { TimeSlotPicker } from "@/components/book/TimeSlotPicker";
import { PageHeader } from "@/components/brand/PageHeader";
import { Button } from "@/components/ui/button";
import type { AvailableSlot } from "@/lib/booking/types";
import {
  BookingBottomBar,
  BOOKING_BOTTOM_BAR_PADDING,
} from "@/components/book/BookingBottomBar";

export default function DateTimePage() {
  const router = useRouter();
  const { date, startTime, barberId, serviceIds } = useBookingStore();
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useBookingGuard(3);

  const shouldLoad = !!date && serviceIds.length > 0 && !!barberId;

  useEffect(() => {
    if (!shouldLoad) return;

    let cancelled = false;

    async function loadSlots() {
      setLoading(true);
      setError(null);

      const result = await getAvailableBookingSlots({
        barberId: barberId!,
        serviceIds,
        date: date!,
      });

      if (cancelled) return;

      if (!result.success) {
        setError(result.error || "خطا در بارگذاری ساعات خالی");
        setLoading(false);
        return;
      }
      setSlots(result.data ?? []);
      setLoading(false);
    }

    loadSlots();
    return () => {
      cancelled = true;
    };
  }, [shouldLoad, date, serviceIds, barberId]);

  const handleNext = () => {
    router.push("/book/summary");
  };

  return (
    <div
      className={`space-y-[var(--space-md)] ${date && startTime ? BOOKING_BOTTOM_BAR_PADDING : ""}`}
    >
      <PageHeader
        eyebrow="مرحله ۳ از ۴"
        title="تاریخ و ساعت"
        description="روز و ساعت مناسب را از تقویم انتخاب کنید."
      />

      <DatePicker barberId={barberId} serviceIds={serviceIds} />

      {date && barberId && (
        <section aria-labelledby="time-slots-heading">
          <h3
            id="time-slots-heading"
            className="mb-3 text-sm font-medium text-[var(--color-ink-muted)]"
          >
            ساعات خالی
          </h3>
          <TimeSlotPicker slots={slots} loading={loading} error={error} />
        </section>
      )}

      {date && startTime && (
        <BookingBottomBar>
          <Button variant="brand" className="w-full gap-2" onClick={handleNext}>
            ادامه
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
        </BookingBottomBar>
      )}
    </div>
  );
}
