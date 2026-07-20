"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserX, Users } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { getBarbers, type PublicBarber } from "@/app/actions/barber";
import { BarberCard } from "@/components/book/BarberCard";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  BookingBottomBar,
  BOOKING_BOTTOM_BAR_PADDING,
} from "@/components/book/BookingBottomBar";

export default function BarberPage() {
  const router = useRouter();
  const { barberId, setBarber, setStep } = useBookingStore();
  const [barbers, setBarbers] = useState<PublicBarber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  useEffect(() => {
    async function load() {
      const result = await getBarbers();
      if (!result.success) {
        setError(result.error || "خطا در بارگذاری آرایشگرها");
        setLoading(false);
        return;
      }
      setBarbers(result.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const handleNext = () => {
    router.push("/book/date-time");
  };

  const handleSkip = () => {
    if (barbers.length === 0) {
      setError("هیچ آرایشگری موجود نیست");
      return;
    }
    setBarber(barbers[0].id, barbers[0].user.name);
    router.push("/book/date-time");
  };

  if (loading && barbers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          در حال بارگذاری آرایشگرها...
        </p>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} className="mt-8" />;
  }

  return (
    <div className={`space-y-6 ${barberId ? BOOKING_BOTTOM_BAR_PADDING : ""}`}>
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">انتخاب آرایشگر</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          آرایشگر مورد نظر خود را انتخاب کنید
        </p>
      </div>

      {/* Barber list */}
      {barbers.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-400 dark:text-zinc-500">
          <Users className="mx-auto h-10 w-10 mb-3 text-zinc-300 dark:text-zinc-600" />
          <p>هیچ آرایشگری موجود نیست</p>
        </div>
      ) : (
        <div className="space-y-3">
          {barbers.map((barber, i) => (
            <BarberCard
              key={barber.id}
              id={barber.id}
              name={barber.user.name}
              bio={barber.bio}
              experienceYears={barber.experienceYears}
              avatar={barber.user.avatar}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Skip option */}
      {barbers.length > 0 && (
        <button
          onClick={handleSkip}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <UserX className="h-4 w-4" />
          آرایشگر خاصی مد نظر نیست
        </button>
      )}

      {barberId && (
        <BookingBottomBar>
          <button
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-150 hover:opacity-90"
            style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}
          >
            ادامه
            <ArrowLeft className="h-4 w-4" />
          </button>
        </BookingBottomBar>
      )}
    </div>
  );
}
