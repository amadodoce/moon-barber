"use client";

import { Calendar, Clock, Scissors, User, FileText } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { formatFaDate } from "@/lib/dates";
import { SurfaceCard } from "@/components/brand/SurfaceCard";

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
    <div className="space-y-[var(--space-sm)]">
      <SurfaceCard>
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)]">
          <Scissors className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
          سرویس‌های انتخابی
        </div>
        <div className="space-y-2">
          {serviceDetails.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-[var(--color-ink-2)]">{service.name}</span>
              <div className="flex shrink-0 items-center gap-3 text-[var(--color-ink-muted)]">
                <span>{service.durationMinutes} دقیقه</span>
                <span className="font-semibold text-[var(--color-accent)]">
                  {service.price.toLocaleString("fa-IR")} تومان
                </span>
              </div>
            </div>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)]">
          <Calendar className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
          تاریخ و ساعت
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-[var(--color-ink-2)]">
            <Calendar className="h-4 w-4 text-[var(--color-ink-faint)]" aria-hidden="true" />
            {formattedDate}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[var(--color-ink-2)]">
            <Clock className="h-4 w-4 text-[var(--color-ink-faint)]" aria-hidden="true" />
            {startTime} – {endTime}
            <span className="text-[var(--color-ink-muted)]">({totalDuration} دقیقه)</span>
          </div>
        </div>
      </SurfaceCard>

      {barberName && (
        <SurfaceCard>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)]">
            <User className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
            آرایشگر
          </div>
          <div className="text-sm text-[var(--color-ink-2)]">{barberName}</div>
        </SurfaceCard>
      )}

      <SurfaceCard>
        <label
          htmlFor="booking-notes"
          className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)]"
        >
          <FileText className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
          توضیحات (اختیاری)
        </label>
        <textarea
          id="booking-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="درخواست یا نکته‌ای برای آرایشگر بنویسید…"
          rows={3}
          className="w-full resize-none rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper-3)] px-3 py-2 text-base text-[var(--color-ink)] transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] md:text-sm"
        />
      </SurfaceCard>

      <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklch,var(--color-accent)_20%,transparent)] bg-[var(--color-accent-soft)] p-[var(--space-md)]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-accent)]">
            مبلغ قابل پرداخت
          </span>
          <span className="text-[var(--text-lg)] font-bold text-[var(--color-accent)]">
            {totalPrice.toLocaleString("fa-IR")} تومان
          </span>
        </div>
      </div>
    </div>
  );
}
