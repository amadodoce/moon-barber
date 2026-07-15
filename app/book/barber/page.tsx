"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserX } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { getBarbers, type BarberWithUser } from "@/app/actions/barber";
import { BarberCard } from "@/components/book/BarberCard";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export default function BarberPage() {
  const router = useRouter();
  const { barberId, setBarber, setStep } = useBookingStore();
  const [barbers, setBarbers] = useState<BarberWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    setStep(3);
    router.push("/book/date-time");
  };

  const handleSkip = () => {
    if (barbers.length === 0) {
      setError("هیچ آرایشگری موجود نیست");
      return;
    }
    // Auto-select the first active barber
    setBarber(barbers[0].id, barbers[0].user.name);
    setStep(3);
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">انتخاب آرایشگر</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          آرایشگر مورد نظر خود را انتخاب کنید
        </p>
      </div>

      {/* Barber list */}
      <div className="space-y-3">
        {barbers.map((barber) => (
          <BarberCard
            key={barber.id}
            id={barber.id}
            name={barber.user.name}
            bio={barber.bio}
            experienceYears={barber.experienceYears}
            avatar={barber.user.avatar}
          />
        ))}
      </div>

      {/* Skip option */}
      <button
        onClick={handleSkip}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
      >
        <UserX className="h-4 w-4" />
        آرایشگر خاصی مد نظر نیست
      </button>

      {/* Bottom bar */}
      {barberId && (
        <div className="sticky bottom-0 -mx-4 bg-white dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700 px-4 py-4">
          <button
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            ادامه
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
