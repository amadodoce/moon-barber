"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isBefore,
  startOfDay,
  getDay,
} from "date-fns";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/stores/booking";
import { formatJalaliMonthYear, parseLocalDate } from "@/lib/dates";

const WEEKDAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];

function toPersianDigits(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}

function formatJalaliDay(date: Date): string {
  return date.toLocaleDateString("fa-IR-u-ca-persian", { day: "numeric" });
}

export function DatePicker() {
  const { date, setDate } = useBookingStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfDay(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = (getDay(monthStart) + 1) % 7;
  const paddingDays = Array.from({ length: startDayOfWeek });

  const selectedDate = date ? parseLocalDate(date) : null;
  const monthLabel = formatJalaliMonthYear(currentMonth);

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
        <h3 className="font-semibold text-[var(--color-ink)]">{monthLabel}</h3>
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
          const isPast = isBefore(day, today);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const dayLabel = formatJalaliDay(day);
          const isoDate = format(day, "yyyy-MM-dd");

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isPast}
              aria-label={
                isPast
                  ? `${dayLabel}، غیرفعال`
                  : isSelected
                    ? `${dayLabel}، انتخاب شده`
                    : isToday
                      ? `${dayLabel}، امروز`
                      : dayLabel
              }
              aria-pressed={isSelected ?? false}
              onClick={() => setDate(isoDate)}
              className={cn(
                "relative flex h-11 items-center justify-center rounded-[var(--radius-input)] text-sm font-medium transition-colors duration-[var(--dur-short)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]",
                isPast
                  ? "cursor-not-allowed text-[var(--color-ink-faint)]"
                  : isSelected
                    ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                    : isToday
                      ? "bg-[var(--color-accent-soft)] font-bold text-[var(--color-accent)]"
                      : "text-[var(--color-ink-2)] hover:bg-[var(--color-paper-3)]"
              )}
            >
              {toPersianDigits(dayLabel)}
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
