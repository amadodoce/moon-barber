"use client";

import { Clock, Sun, Moon } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { Spinner } from "@/components/ui/Spinner";
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
      <div className="flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-500">
        <Spinner size="lg" />
        <p className="mt-3 text-sm">در حال بارگذاری ساعات خالی...</p>
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
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Sun className="h-4 w-4 text-amber-500" />
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
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Moon className="h-4 w-4 text-amber-500" />
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
      className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all ${
        isSelected
          ? "border-amber-500 bg-amber-500 text-white shadow-sm"
          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
      }`}
    >
      {slot.startTime}
    </button>
  );
}
