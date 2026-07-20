"use client";

import { Calendar, Clock, Scissors, User, FileText } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { formatFaDate } from "@/lib/dates";

export function BookingSummary() {
  const {
    serviceDetails,
    date,
    startTime,
    endTime,
    barberName,
    totalDuration,
    totalPrice,
    notes,
    setNotes,
  } = useBookingStore();

  const formattedDate = date
    ? formatFaDate(date, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="space-y-4">
      {/* Services */}
      <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <Scissors className="h-4 w-4 text-[var(--booking-gold)]" />
          سرویس‌های انتخابی
        </div>
        <div className="space-y-2">
          {serviceDetails.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-zinc-700 dark:text-zinc-300">{service.name}</span>
              <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                <span>{service.durationMinutes} دقیقه</span>
                <span className="font-semibold text-[var(--booking-gold)]">
                  {service.price.toLocaleString("fa-IR")} تومان
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Date & Time */}
      <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <Calendar className="h-4 w-4 text-[var(--booking-gold)]" />
          تاریخ و ساعت
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <Calendar className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <Clock className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            {startTime} - {endTime}
            <span className="text-zinc-400 dark:text-zinc-500">({totalDuration} دقیقه)</span>
          </div>
        </div>
      </div>

      {/* Barber */}
      {barberName && (
        <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <User className="h-4 w-4 text-[var(--booking-gold)]" />
            آرایشگر
          </div>
          <div className="text-sm text-zinc-700 dark:text-zinc-300">{barberName}</div>
        </div>
      )}

      {/* Notes */}
      <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <FileText className="h-4 w-4 text-[var(--booking-gold)]" />
          توضیحات (اختیاری)
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="توضیحات خود را اینجا بنویسید..."
          rows={3}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-700 transition-colors placeholder:text-zinc-400 focus:border-[var(--booking-gold)] focus:outline-2 focus:outline-[var(--booking-gold)] focus:outline-offset-1 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder:text-zinc-500 md:text-sm"
        />
      </div>

      {/* Total */}
      <div className="rounded-2xl bg-gradient-to-l from-[var(--booking-gold)]/10 to-[var(--booking-gold)]/5 border border-[var(--booking-gold)]/20 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--booking-gold)]">
            مبلغ قابل پرداخت
          </span>
          <span className="text-lg font-bold text-[var(--booking-gold)]">
            {totalPrice.toLocaleString("fa-IR")} تومان
          </span>
        </div>
      </div>
    </div>
  );
}
