"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDay,
} from "date-fns-jalali";
import { Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTehranTodayString } from "@/lib/booking/timezone";
import { formatJalaliDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";

const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

function toPersianDigits(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}

interface JalaliDateFieldProps {
  value: string;
  onChange: (isoDate: string) => void;
  label?: string;
  minDate?: string;
  error?: string;
}

export function JalaliDateField({
  value,
  onChange,
  label = "تاریخ",
  minDate,
  error,
}: JalaliDateFieldProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const todayStr = getTehranTodayString();
  const min = minDate ?? todayStr;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = (getDay(monthStart) + 1) % 7;
  const paddingDays = Array.from({ length: startDayOfWeek });
  const monthLabel = format(currentMonth, "MMMM yyyy");

  const displayValue = value
    ? formatJalaliDate(value, { year: "numeric", month: "long", day: "numeric" })
    : "انتخاب تاریخ";

  return (
    <div className="relative">
      {label && (
        <label className="text-sm font-medium text-[var(--text-primary)]">{label}</label>
      )}
      <Button
        type="button"
        variant="outline"
        className="mt-1.5 h-10 w-full justify-between rounded-xl border-[var(--surface-border)] bg-[var(--surface-base)] text-[var(--text-primary)]"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{displayValue}</span>
        <Calendar className="h-4 w-4 opacity-60" />
      </Button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {open && (
        <div className="absolute z-50 mt-2 w-full min-w-[280px] rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold">{monthLabel}</span>
            <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1 text-center text-xs text-[var(--color-ink-muted)]">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {paddingDays.map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => {
              const iso = format(day, "yyyy-MM-dd");
              const disabled = iso < min;
              const selected = value === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-9 items-center justify-center rounded text-sm",
                    disabled && "cursor-not-allowed opacity-40",
                    selected && "bg-[var(--color-accent)] text-[var(--color-accent-ink)]",
                    !selected && !disabled && "hover:bg-[var(--color-paper-3)]"
                  )}
                >
                  {toPersianDigits(format(day, "d"))}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
