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

const MONTH_NAMES = [
  "ژانویه",
  "فوریه",
  "مارس",
  "آوریل",
  "مه",
  "ژوئن",
  "ژوئیه",
  "اوت",
  "سپتامبر",
  "اکتبر",
  "نوامبر",
  "دسامبر",
];

export function DatePicker() {
  const { date, setDate } = useBookingStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfDay(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = getDay(monthStart);
  const paddingDays = Array.from({ length: startDayOfWeek });

  const selectedDate = date ? new Date(date) : null;

  return (
    <div className="rounded-2xl bg-white border border-zinc-200 p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-zinc-600" />
        </button>
        <h3 className="font-semibold text-zinc-900">
          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-zinc-600" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-zinc-400 py-2"
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
              className={`relative flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                isPast
                  ? "text-zinc-300 cursor-not-allowed"
                  : isSelected
                    ? "bg-amber-500 text-white"
                    : isToday
                      ? "bg-amber-50 text-amber-700 font-bold"
                      : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {format(day, "d")}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
