"use client";

import { User, Star } from "lucide-react";
import { useBookingStore } from "@/stores/booking";

interface BarberCardProps {
  id: string;
  name: string;
  bio: string | null;
  experienceYears: number | null;
  avatar: string | null;
  index?: number;
}

export function BarberCard({
  id,
  name,
  bio,
  experienceYears,
  avatar,
  index = 0,
}: BarberCardProps) {
  const { barberId, setBarber } = useBookingStore();
  const isSelected = barberId === id;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => setBarber(id, name)}
      className={`relative flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-right transition-colors duration-150 ${
        isSelected
          ? "border-[#D4A853] bg-[#D4A853]/5"
          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600"
      }`}
    >
      {/* Radio indicator */}
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 mt-0.5 ${
          isSelected
            ? "border-[#D4A853] bg-[#D4A853]"
            : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700"
        }`}
      >
        {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>

      {/* Avatar */}
      <div
        className={`h-16 w-16 shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700 transition-shadow duration-150 ${
          isSelected ? "ring-2 ring-[#D4A853] ring-offset-2 ring-offset-white dark:ring-offset-zinc-800" : ""
        }`}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{name}</h3>
        {experienceYears && (
          <div className="mt-1 flex items-center gap-1 text-sm text-[#D4A853]">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>{experienceYears} سال تجربه</span>
          </div>
        )}
        {bio && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{bio}</p>
        )}
      </div>
    </button>
  );
}
