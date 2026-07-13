"use client";

import { User, Star } from "lucide-react";
import { useBookingStore } from "@/stores/booking";

interface BarberCardProps {
  id: string;
  name: string;
  bio: string | null;
  experienceYears: number | null;
  avatar: string | null;
}

export function BarberCard({
  id,
  name,
  bio,
  experienceYears,
  avatar,
}: BarberCardProps) {
  const { barberId, setBarber } = useBookingStore();
  const isSelected = barberId === id;

  return (
    <button
      type="button"
      onClick={() => setBarber(id, name)}
      className={`relative flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-right transition-all ${
        isSelected
          ? "border-amber-500 bg-amber-50 shadow-sm"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
      }`}
    >
      {/* Radio indicator */}
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors mt-0.5 ${
          isSelected
            ? "border-amber-500 bg-amber-500"
            : "border-zinc-300 bg-white"
        }`}
      >
        {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>

      {/* Avatar */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-zinc-100">
        {avatar ? (
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-8 w-8 text-zinc-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-zinc-900">{name}</h3>
        {experienceYears && (
          <div className="mt-1 flex items-center gap-1 text-sm text-amber-600">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>{experienceYears} سال تجربه</span>
          </div>
        )}
        {bio && (
          <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{bio}</p>
        )}
      </div>
    </button>
  );
}
