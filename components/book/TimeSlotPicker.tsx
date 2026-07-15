"use client";

import { Clock, Sun, Moon } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import type { AvailableSlot } from "@/lib/availability";

interface TimeSlotPickerProps {
  slots: AvailableSlot[];
  loading: boolean;
  error: string | null;
}

export function TimeSlotPicker({ slots, loading, error }: TimeSlotPickerProps) {
  const { startTime, setTime } = useBookingStore();

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700 animate-[shimmer_1.5s_infinite] bg-[length:200%_100] bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700" />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-11 rounded-xl bg-zinc-200 dark:bg-zinc-700 animate-[shimmer_1.5s_infinite] bg-[length:200%_100] bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-700"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-sm text-red-500 dark:text-red-400">{error}</div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
        <Clock className="mx-auto h-10 w-10 mb-3 text-zinc-300 dark:text-zinc-600" />
        <p>ساعت خالی برای این تاریخ وجود ندارد</p>
        <p className="mt-1">لطفاً تاریخ دیگری انتخاب کنید</p>
      </div>
    );
  }

  // Split into morning and afternoon
  const morningSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime.split(":")[0]);
    return hour < 12;
  });
  const afternoonSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime.split(":")[0]);
    return hour >= 12;
  });

  return (
    <div className="space-y-4">
      {morningSlots.length > 0 && (
        <div className="animate-[fade-in-up_0.3s_ease-out_both]">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Sun className="h-4 w-4 text-[#D4A853]" />
            صبح
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {morningSlots.map((slot) => (
              <SlotButton
                key={slot.startTime}
                slot={slot}
                isSelected={startTime === slot.startTime}
                onSelect={() => setTime(slot.startTime, slot.endTime)}
              />
            ))}
          </div>
        </div>
      )}

      {afternoonSlots.length > 0 && (
        <div className="animate-[fade-in-up_0.3s_ease-out_both]">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Moon className="h-4 w-4 text-[#D4A853]" />
            بعدازظهر
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {afternoonSlots.map((slot) => (
              <SlotButton
                key={slot.startTime}
                slot={slot}
                isSelected={startTime === slot.startTime}
                onSelect={() => setTime(slot.startTime, slot.endTime)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SlotButton({
  slot,
  isSelected,
  onSelect,
}: {
  slot: AvailableSlot;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.95] ${
        isSelected
          ? "border-[#D4A853] bg-[#D4A853] text-white shadow-md shadow-[#D4A853]/20"
          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-[#D4A853]/40 dark:hover:border-[#D4A853]/40 hover:bg-[#D4A853]/5 dark:hover:bg-[#D4A853]/10 hover:shadow-md hover:shadow-[#D4A853]/5"
      }`}
    >
      {slot.startTime}
    </button>
  );
}
