"use client";

import { Clock, Banknote, Check } from "lucide-react";
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
  index = 0,
}: ServiceCardProps) {
  const { serviceIds, toggleService } = useBookingStore();
  const isSelected = serviceIds.includes(id);

  return (
    <button
      type="button"
      onClick={() =>
        toggleService({ id, name, durationMinutes, price: Number(price) })
      }
      style={{ animationDelay: `${index * 60}ms` }}
      className={`relative flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-right transition-all duration-200 animate-[fade-in-up_0.4s_ease-out_both] active:scale-[0.98] ${
        isSelected
          ? "border-[#D4A853] bg-[#D4A853]/5 shadow-md shadow-[#D4A853]/10"
          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg hover:shadow-[#D4A853]/5"
      }`}
    >
      {/* Checkbox indicator */}
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 mt-0.5 ${
          isSelected
            ? "border-[#D4A853] bg-[#D4A853] text-white"
            : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700"
        }`}
      >
        {isSelected && <Check className="h-4 w-4" />}
      </div>

      {/* Service image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={name}
          className="h-16 w-16 rounded-xl object-cover"
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{name}</h3>
        {description && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {durationMinutes} دقیقه
          </span>
          <span className="flex items-center gap-1 font-semibold text-[#D4A853]">
            <Banknote className="h-4 w-4" />
            {Number(price).toLocaleString("fa-IR")} تومان
          </span>
        </div>
      </div>
    </button>
  );
}
