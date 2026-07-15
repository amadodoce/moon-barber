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
import { useBookingStore } from "@/stores/booking";

const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

// Gregorian month names in Persian (aligned with JS month indices 0-11)
const GREGORIAN_MONTHS_FA = [
  "ژانویه",   // January
  "فوریه",    // February
  "مارس",     // March
  "آوریل",    // April
  "مه",       // May
  "ژوئن",     // June
  "ژوئیه",    // July
  "اوت",      // August
  "سپتامبر",  // September
  "اکتبر",    // October
  "نوامبر",   // November
  "دسامبر",   // December
];

function toPersianDigits(num: number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export function DatePicker() {
  const { date, setDate } = useBookingStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfDay(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Shift getDay() so Saturday = 0 (Iranian week starts Saturday)
  const startDayOfWeek = (getDay(monthStart) + 1) % 7;
  const paddingDays = Array.from({ length: startDayOfWeek });

  const selectedDate = date ? new Date(date) : null;

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors active:scale-95"
        >
          <ChevronRight className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </button>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {GREGORIAN_MONTHS_FA[currentMonth.getMonth()]} {toPersianDigits(currentMonth.getFullYear())}
        </h3>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors active:scale-95"
        >
          <ChevronLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-zinc-400 dark:text-zinc-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const isPast = isBefore(day, today);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => setDate(format(day, "yyyy-MM-dd"))}
              className={`relative flex h-11 items-center justify-center rounded-lg text-sm font-medium transition-all duration-150 active:scale-95 ${
                isPast
                  ? "text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
                  : isSelected
                    ? "bg-[#D4A853] text-white shadow-md shadow-[#D4A853]/20"
                    : isToday
                      ? "bg-[#D4A853]/10 text-[#D4A853] font-bold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              }`}
            >
              {toPersianDigits(parseInt(format(day, "d"), 10))}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#D4A853]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
