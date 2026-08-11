"use client";

import { useEffect } from "react";
import { Clock, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/stores/booking";
import type { AvailableSlot } from "@/lib/availability";

interface TimeSlotPickerProps {
  slots: AvailableSlot[];
  loading: boolean;
  error: string | null;
}

const shimmerClass =
  "animate-[shimmer_1.5s_infinite] bg-[length:200%_100%] bg-gradient-to-r from-[var(--color-paper-3)] via-[var(--color-paper-2)] to-[var(--color-paper-3)]";

export function TimeSlotPicker({ slots, loading, error }: TimeSlotPickerProps) {
  const { startTime, setTime } = useBookingStore();

  useEffect(() => {
    if (startTime && !loading && slots.length > 0) {
      const stillValid = slots.some((s) => s.startTime === startTime);
      if (!stillValid) {
        setTime(null, null);
      }
    }
  }, [slots, loading, startTime, setTime]);

  if (loading) {
    return (
      <div className="space-y-[var(--space-xs)]">
        <div className={cn("h-4 w-24 rounded-[var(--radius-input)]", shimmerClass)} />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn("h-11 rounded-[var(--radius-input)]", shimmerClass)}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-[var(--space-xl)] text-center text-sm text-[var(--status-failed-fg)]">
        {error}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="py-[var(--space-xl)] text-center text-sm text-[var(--color-ink-muted)]">
        <Clock
          className="mx-auto mb-3 h-10 w-10 text-[var(--color-ink-faint)]"
          aria-hidden="true"
        />
        <p>ساعت خالی برای این تاریخ وجود ندارد</p>
        <p className="mt-1 text-[var(--color-ink-faint)]">لطفاً تاریخ دیگری انتخاب کنید</p>
      </div>
    );
  }

  const morningSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime.split(":")[0], 10);
    return hour < 12;
  });
  const afternoonSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime.split(":")[0], 10);
    return hour >= 12;
  });

  return (
    <div className="space-y-[var(--space-sm)]">
      {morningSlots.length > 0 && (
        <div className="animate-[fade-in-up_0.3s_ease-out_both]">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)]">
            <Sun className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
            صبح
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
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
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)]">
            <Moon className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
            بعدازظهر
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
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
      aria-pressed={isSelected}
      aria-label={`ساعت ${slot.startTime} تا ${slot.endTime}`}
      onClick={onSelect}
      className={cn(
        "rounded-[var(--radius-input)] border px-3 py-2.5 text-sm font-medium transition-colors duration-[var(--dur-short)]",
        "min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]",
        isSelected
          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
          : "border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-ink-2)] hover:border-[color-mix(in_oklch,var(--color-accent)_40%,var(--color-rule))] hover:bg-[var(--color-accent-soft)]"
      )}
    >
      {slot.startTime}
      <span className="mx-0.5 text-[10px] opacity-70">–</span>
      {slot.endTime}
    </button>
  );
}
