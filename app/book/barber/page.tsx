"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserX } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { getBarbers, type BarberWithUser } from "@/app/actions/barber";
import { getAvailableBookingSlots } from "@/app/actions/appointment";
import { BarberCard } from "@/components/book/BarberCard";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export default function BarberPage() {
  const router = useRouter();
  const { barberId, setBarber, serviceIds, date, setStep } = useBookingStore();
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
    setStep(4);
    router.push("/book/summary");
  };

  const handleSkip = async () => {
    if (!date || serviceIds.length === 0) return;

    setLoading(true);
    for (const barber of barbers) {
      const result = await getAvailableBookingSlots({
        barberId: barber.id,
        serviceIds,
        date,
      });
      if (result.success && result.data && result.data.length > 0) {
        setBarber(barber.id, barber.user.name);
        setLoading(false);
        setStep(4);
        router.push("/book/summary");
        return;
      }
    }
    setLoading(false);
    setError("هیچ آرایشگری در این تاریخ وقت خالی ندارد");
  };

  if (loading && barbers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-zinc-500">
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
        <h2 className="text-xl font-bold text-zinc-900">انتخاب آرایشگر</h2>
        <p className="mt-1 text-sm text-zinc-500">
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
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
      >
        <UserX className="h-4 w-4" />
        آرایشگر خاصی مد نظر نیست
      </button>

      {/* Bottom bar */}
      {barberId && (
        <div className="sticky bottom-0 -mx-4 bg-white border-t border-zinc-100 px-4 py-4">
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
