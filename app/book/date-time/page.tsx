"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { getAvailableBookingSlots } from "@/app/actions/appointment";
import { DatePicker } from "@/components/book/DatePicker";
import { TimeSlotPicker } from "@/components/book/TimeSlotPicker";
import type { AvailableSlot } from "@/lib/availability";

export default function DateTimePage() {
  const router = useRouter();
  const { date, startTime, barberId, serviceIds, setStep } = useBookingStore();
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date || serviceIds.length === 0 || !barberId) {
      setSlots([]);
      return;
    }

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
  }, [date, serviceIds, barberId]);

  const handleNext = () => {
    setStep(4);
    router.push("/book/summary");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">تاریخ و ساعت</h2>
        <p className="mt-1 text-sm text-zinc-500">
          تاریخ و ساعت مورد نظر خود را انتخاب کنید
        </p>
      </div>

      {/* Date picker */}
      <DatePicker />

      {/* Time slots */}
      {date && barberId && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-zinc-500">
            ساعات خالی
          </h3>
          <TimeSlotPicker slots={slots} loading={loading} error={error} />
        </div>
      )}

      {/* Bottom bar */}
      {date && startTime && (
        <div className="sticky bottom-0 -mx-4 bg-white border-t border-zinc-100 px-4 py-4">
          <button
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            ادامه
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
