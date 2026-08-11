"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserCheck, Users } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { useBookingGuard } from "@/hooks/useBookingGuard";
import { getBarbers, type PublicBarber } from "@/app/actions/barber";
import { BarberCard } from "@/components/book/BarberCard";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { PageHeader } from "@/components/brand/PageHeader";
import { EmptyState } from "@/components/brand/EmptyState";
import { Button } from "@/components/ui/button";
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

  useBookingGuard(2);

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

  const handleAutoAssign = () => {
    if (barbers.length === 0) {
      setError("هیچ آرایشگری موجود نیست");
      return;
    }
    setBarber(barbers[0].id, barbers[0].user.name);
    router.push("/book/date-time");
  };

  if (loading && barbers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[var(--space-2xl)]">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
          در حال بارگذاری آرایشگرها…
        </p>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} className="mt-[var(--space-md)]" />;
  }

  return (
    <div className={`space-y-[var(--space-md)] ${barberId ? BOOKING_BOTTOM_BAR_PADDING : ""}`}>
      <PageHeader
        eyebrow="مرحله ۲ از ۴"
        title="انتخاب آرایشگر"
        description="آرایشگر مورد نظر را انتخاب کنید یا تخصیص خودکار را بپذیرید."
      />

      {barbers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="آرایشگری موجود نیست"
          description="در حال حاضر امکان رزرو با آرایشگر وجود ندارد."
        />
      ) : (
        <div className="space-y-[var(--space-xs)]" role="radiogroup" aria-label="انتخاب آرایشگر">
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

      {barbers.length > 0 && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleAutoAssign}
        >
          <UserCheck className="h-4 w-4" aria-hidden="true" />
          تخصیص خودکار به {barbers[0].user.name}
        </Button>
      )}

      {barberId && (
        <BookingBottomBar>
          <Button variant="brand" className="w-full gap-2" onClick={handleNext}>
            ادامه
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
        </BookingBottomBar>
      )}
    </div>
  );
}
