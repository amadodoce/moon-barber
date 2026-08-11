"use client";

import { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDay,
  getYear,
  getMonth,
} from "date-fns-jalali";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/stores/booking";
import { getTehranTodayString } from "@/lib/booking/timezone";
import { getMonthAvailability } from "@/app/actions/appointment";
import type { DayAvailability } from "@/lib/booking/types";

const WEEKDAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];

function toPersianDigits(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}

interface DatePickerProps {
  barberId: string | null;
  serviceIds: string[];
}

export function DatePicker({ barberId, serviceIds }: DatePickerProps) {
  const { date, setDate } = useBookingStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Map<string, DayAvailability["status"]>>(
    new Map()
  );

  const todayStr = getTehranTodayString();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = (getDay(monthStart) + 1) % 7;
  const paddingDays = Array.from({ length: startDayOfWeek });
  const monthLabel = format(currentMonth, "MMMM yyyy");

  const jalaliYear = getYear(currentMonth);
  const jalaliMonth = getMonth(currentMonth) + 1;
  const canLoadAvailability = !!barberId && serviceIds.length > 0;
  const fetchKey = canLoadAvailability
    ? `${barberId}:${serviceIds.join(",")}:${jalaliYear}:${jalaliMonth}`
    : null;
  const loadingMonth = !!fetchKey && loadedKey !== fetchKey;
  const availabilityMap = canLoadAvailability
    ? availability
    : new Map<string, DayAvailability["status"]>();

  useEffect(() => {
    if (!fetchKey || !barberId) {
      return;
    }

    let cancelled = false;

    void getMonthAvailability({
      barberId,
      serviceIds,
      jalaliYear,
      jalaliMonth,
    }).then((result) => {
      if (cancelled) return;
      if (result.success && result.data) {
        setAvailability(new Map(result.data.map((d) => [d.date, d.status])));
      } else {
        setAvailability(new Map());
      }
      setLoadedKey(fetchKey);
    });

    return () => {
      cancelled = true;
    };
  }, [fetchKey, barberId, serviceIds, jalaliYear, jalaliMonth]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-[var(--space-md)]">
      <div className="mb-[var(--space-sm)] flex items-center justify-between">
        <button
          type="button"
          aria-label={`ماه قبل، ${monthLabel}`}
          onClick={goToPreviousMonth}
          className="rounded-[var(--radius-input)] p-2 transition-colors duration-[var(--dur-short)] hover:bg-[var(--color-paper-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
        >
          <ChevronRight className="h-5 w-5 text-[var(--color-ink-2)]" aria-hidden="true" />
        </button>
        <h3 className="font-semibold text-[var(--color-ink)]">
          {monthLabel}
          {loadingMonth && (
            <span className="mr-2 text-xs font-normal text-[var(--color-ink-muted)]">
              …
            </span>
          )}
        </h3>
        <button
          type="button"
          aria-label={`ماه بعد، ${monthLabel}`}
          onClick={goToNextMonth}
          className="rounded-[var(--radius-input)] p-2 transition-colors duration-[var(--dur-short)] hover:bg-[var(--color-paper-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
        >
          <ChevronLeft className="h-5 w-5 text-[var(--color-ink-2)]" aria-hidden="true" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-[var(--color-ink-muted)]"
          >
            {day.slice(0, 2)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} aria-hidden="true" />
        ))}
        {days.map((day) => {
          const isoDate = format(day, "yyyy-MM-dd");
          const dayLabel = format(day, "d");
          const status = availabilityMap.get(isoDate);
          const isPast = isoDate < todayStr;
          const isSelected = date === isoDate;
          const isToday = isoDate === todayStr;
          const isDisabled =
            isPast || status === "closed" || status === "full" || status === "past";

          return (
            <button
              key={isoDate}
              type="button"
              disabled={isDisabled}
              aria-label={
                isDisabled
                  ? `${dayLabel}، غیرفعال`
                  : isSelected
                    ? `${dayLabel}، انتخاب شده`
                    : isToday
                      ? `${dayLabel}، امروز`
                      : dayLabel
              }
              aria-pressed={isSelected}
              onClick={() => setDate(isoDate)}
              className={cn(
                "relative flex h-11 items-center justify-center rounded-[var(--radius-input)] text-sm font-medium transition-colors duration-[var(--dur-short)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]",
                isDisabled
                  ? "cursor-not-allowed text-[var(--color-ink-faint)] line-through decoration-[var(--color-ink-faint)]/50"
                  : isSelected
                    ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                    : isToday
                      ? "bg-[var(--color-accent-soft)] font-bold text-[var(--color-accent)]"
                      : status === "available"
                        ? "text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)]"
                        : "text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)]"
              )}
            >
              {toPersianDigits(dayLabel)}
              {status === "full" && !isPast && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--color-ink-muted)]"
                />
              )}
              {isToday && !isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--color-accent)]"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
