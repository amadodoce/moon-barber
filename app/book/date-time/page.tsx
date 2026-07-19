"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { getAvailableBookingSlots } from "@/app/actions/appointment";
import { DatePicker } from "@/components/book/DatePicker";
import { TimeSlotPicker } from "@/components/book/TimeSlotPicker";
import type { AvailableSlot } from "@/lib/availability";
import {
  BookingBottomBar,
  BOOKING_BOTTOM_BAR_PADDING,
} from "@/components/book/BookingBottomBar";

export default function DateTimePage() {
  const router = useRouter();
  const { date, startTime, barberId, serviceIds, setStep } = useBookingStore();
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shouldLoad = !!date && serviceIds.length > 0 && !!barberId;

  useEffect(() => {
    setStep(3);
  }, [setStep]);

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
      className={`space-y-6 ${date && startTime ? BOOKING_BOTTOM_BAR_PADDING : ""}`}
    >
      <div className="animate-[fade-in-up_0.4s_ease-out_both]">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">تاریخ و ساعت</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          تاریخ و ساعت مورد نظر خود را انتخاب کنید
        </p>
      </div>

      {/* Date picker */}
      <div className="animate-[fade-in-up_0.4s_ease-out_both] [animation-delay:60ms]">
        <DatePicker />
      </div>

      {/* Time slots */}
      {date && barberId && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400 animate-[fade-in-up_0.4s_ease-out_both] [animation-delay:120ms]">
            ساعات خالی
          </h3>
          <TimeSlotPicker slots={slots} loading={loading} error={error} />
        </div>
      )}

      {date && startTime && (
        <BookingBottomBar>
          <button
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4A853] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#D4A853]/20 transition-all duration-200 hover:bg-[#C49A48] active:scale-[0.98]"
          >
            ادامه
            <ArrowLeft className="h-4 w-4" />
          </button>
        </BookingBottomBar>
      )}
    </div>
  );
}
