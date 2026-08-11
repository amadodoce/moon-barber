"use client";

import Image from "next/image";
import { User, Star } from "lucide-react";
import { cn } from "@/lib/utils";
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
}: BarberCardProps) {
  const { barberId, setBarber } = useBookingStore();
  const isSelected = barberId === id;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => setBarber(id, name)}
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
            ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
            : "border-[var(--color-rule)] bg-[var(--color-paper-3)]"
        )}
      >
        {isSelected && (
          <div className="h-2 w-2 rounded-full bg-[var(--color-accent-ink)]" />
        )}
      </div>

      <div
        className={cn(
          "h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[var(--color-paper-3)] transition-shadow duration-[var(--dur-short)]",
          isSelected && "ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-paper-2)]"
        )}
      >
        {avatar ? (
          <Image
            src={avatar}
            alt=""
            width={64}
            height={64}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-8 w-8 text-[var(--color-ink-faint)]" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-[var(--color-ink)]">{name}</h3>
        {experienceYears ? (
          <div className="mt-1 flex items-center gap-1 text-sm text-[var(--color-accent)]">
            <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            <span>{experienceYears} سال تجربه</span>
          </div>
        ) : null}
        {bio && (
          <p className="mt-1 line-clamp-2 text-sm text-[var(--color-ink-muted)]">{bio}</p>
        )}
      </div>
    </button>
  );
}
