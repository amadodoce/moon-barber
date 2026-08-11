"use client";

import Image from "next/image";
import { Clock, Banknote, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/stores/booking";

interface ServiceCardProps {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  imageUrl: string | null;
  index?: number;
}

export function ServiceCard({
  id,
  name,
  description,
  durationMinutes,
  price,
  imageUrl,
}: ServiceCardProps) {
  const { serviceIds, toggleService } = useBookingStore();
  const isSelected = serviceIds.includes(id);

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() =>
        toggleService({ id, name, durationMinutes, price: Number(price) })
      }
      className={cn(
        "relative flex w-full items-start gap-[var(--space-sm)] rounded-[var(--radius-card)] border p-[var(--space-md)] text-start transition-[border-color,background-color] duration-[var(--dur-short)]",
        "min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]",
        isSelected
          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
          : "border-[var(--color-rule)] bg-[var(--color-paper-2)] hover:border-[color-mix(in_oklch,var(--color-accent)_40%,var(--color-rule))]"
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-[var(--dur-short)]",
          isSelected
            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
            : "border-[var(--color-rule)] bg-[var(--color-paper-3)]"
        )}
      >
        {isSelected && <Check className="h-4 w-4" />}
      </div>

      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          width={64}
          height={64}
          unoptimized
          className="h-16 w-16 shrink-0 rounded-[var(--radius-input)] object-cover"
        />
      )}

      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-[var(--color-ink)]">{name}</h3>
        {description && (
          <p className="mt-1 line-clamp-2 text-sm text-[var(--color-ink-muted)]">
            {description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-[var(--space-sm)] text-sm text-[var(--color-ink-2)]">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {durationMinutes} دقیقه
          </span>
          <span className="flex items-center gap-1 font-semibold text-[var(--color-accent)]">
            <Banknote className="h-4 w-4" aria-hidden="true" />
            {Number(price).toLocaleString("fa-IR")} تومان
          </span>
        </div>
      </div>
    </button>
  );
}
