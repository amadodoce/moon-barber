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
      <div className="rounded-2xl bg-white border border-zinc-200 p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-zinc-500">
          <Scissors className="h-4 w-4 text-amber-500" />
          سرویس‌های انتخابی
        </div>
        <div className="space-y-2">
          {serviceDetails.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-zinc-700">{service.name}</span>
              <div className="flex items-center gap-3 text-zinc-500">
                <span>{service.durationMinutes} دقیقه</span>
                <span className="font-semibold text-amber-600">
                  {service.price.toLocaleString("fa-IR")} تومان
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Date & Time */}
      <div className="rounded-2xl bg-white border border-zinc-200 p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-zinc-500">
          <Calendar className="h-4 w-4 text-amber-500" />
          تاریخ و ساعت
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-zinc-700">
            <Calendar className="h-4 w-4 text-zinc-400" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-2 text-zinc-700">
            <Clock className="h-4 w-4 text-zinc-400" />
            {startTime} - {endTime}
            <span className="text-zinc-400">({totalDuration} دقیقه)</span>
          </div>
        </div>
      </div>

      {/* Barber */}
      {barberName && (
        <div className="rounded-2xl bg-white border border-zinc-200 p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-zinc-500">
            <User className="h-4 w-4 text-amber-500" />
            آرایشگر
          </div>
          <div className="text-sm text-zinc-700">{barberName}</div>
        </div>
      )}

      {/* Notes */}
      <div className="rounded-2xl bg-white border border-zinc-200 p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-zinc-500">
          <FileText className="h-4 w-4 text-amber-500" />
          توضیحات (اختیاری)
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="توضیحات خود را اینجا بنویسید..."
          rows={3}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
        />
      </div>

      {/* Total */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-amber-700">
            مبلغ قابل پرداخت
          </span>
          <span className="text-lg font-bold text-amber-700">
            {totalPrice.toLocaleString("fa-IR")} تومان
          </span>
        </div>
      </div>
    </div>
  );
}
