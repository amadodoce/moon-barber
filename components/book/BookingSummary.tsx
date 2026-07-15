"use client";

import { Calendar, Clock, Scissors, User, FileText } from "lucide-react";
import { useBookingStore } from "@/stores/booking";

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
    ? new Date(date).toLocaleDateString("fa-IR", {
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
          <Scissors className="h-4 w-4 text-amber-500" />
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
                <span className="font-semibold text-amber-600 dark:text-amber-400">
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
          <Calendar className="h-4 w-4 text-amber-500" />
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
            <User className="h-4 w-4 text-amber-500" />
            آرایشگر
          </div>
          <div className="text-sm text-zinc-700 dark:text-zinc-300">{barberName}</div>
        </div>
      )}

      {/* Notes */}
      <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <FileText className="h-4 w-4 text-amber-500" />
          توضیحات (اختیاری)
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="توضیحات خود را اینجا بنویسید..."
          rows={3}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
        />
      </div>

      {/* Total */}
      <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
            مبلغ قابل پرداخت
          </span>
          <span className="text-lg font-bold text-amber-700 dark:text-amber-400">
            {totalPrice.toLocaleString("fa-IR")} تومان
          </span>
        </div>
      </div>
    </div>
  );
}
