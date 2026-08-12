"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, UserCheck, Users } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { useBookingGuard } from "@/hooks/useBookingGuard";
import { BarberCard } from "@/components/book/BarberCard";
import { PageHeader } from "@/components/brand/PageHeader";
import { EmptyState } from "@/components/brand/EmptyState";
import { Button } from "@/components/ui/button";
import {
  BookingBottomBar,
  BOOKING_BOTTOM_BAR_PADDING,
} from "@/components/book/BookingBottomBar";
import type { PublicBarber } from "@/app/actions/barber";

interface BookBarberClientProps {
  barbers: PublicBarber[];
}

export function BookBarberClient({ barbers }: BookBarberClientProps) {
  const router = useRouter();
  const { barberId, setBarber } = useBookingStore();

  useBookingGuard(2);

  const handleNext = () => {
    router.push("/book/date-time");
  };

  const handleAutoAssign = () => {
    if (barbers.length === 0) return;
    setBarber(barbers[0].id, barbers[0].user.name);
    router.push("/book/date-time");
  };

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
        <Button variant="outline" className="w-full gap-2" onClick={handleAutoAssign}>
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
