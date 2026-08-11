"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Scissors } from "lucide-react";
import { useBookingStore } from "@/stores/booking";
import { ServiceCard } from "@/components/book/ServiceCard";
import { PageHeader } from "@/components/brand/PageHeader";
import { EmptyState } from "@/components/brand/EmptyState";
import { Button } from "@/components/ui/button";
import {
  BookingBottomBar,
  BOOKING_BOTTOM_BAR_PADDING,
} from "@/components/book/BookingBottomBar";

export interface BookServiceItem {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  imageUrl: string | null;
}

interface BookServicesClientProps {
  services: BookServiceItem[];
}

export function BookServicesClient({ services }: BookServicesClientProps) {
  const router = useRouter();
  const { serviceIds, totalDuration, totalPrice } = useBookingStore();

  const handleNext = () => {
    router.push("/book/barber");
  };

  return (
    <div
      className={`space-y-[var(--space-md)] ${serviceIds.length > 0 ? BOOKING_BOTTOM_BAR_PADDING : ""}`}
    >
      <PageHeader
        eyebrow="مرحله ۱ از ۴"
        title="انتخاب سرویس"
        description="یک یا چند سرویس را برای نوبت خود انتخاب کنید."
      />

      {services.length === 0 ? (
        <EmptyState
          icon={<Scissors className="h-10 w-10" />}
          title="سرویسی موجود نیست"
          description="در حال حاضر سرویسی برای رزرو فعال نشده است."
        />
      ) : (
        <div className="space-y-[var(--space-xs)]">
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              name={service.name}
              description={service.description}
              durationMinutes={service.durationMinutes}
              price={service.price}
              imageUrl={service.imageUrl}
              index={i}
            />
          ))}
        </div>
      )}

      {serviceIds.length > 0 && (
        <BookingBottomBar>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-[var(--color-ink-muted)]">
              {serviceIds.length} سرویس انتخاب شده
            </span>
            <div className="flex items-center gap-[var(--space-sm)]">
              <span className="text-[var(--color-ink-muted)]">{totalDuration} دقیقه</span>
              <span className="font-bold text-[var(--color-accent)]">
                {totalPrice.toLocaleString("fa-IR")} تومان
              </span>
            </div>
          </div>
          <Button variant="brand" className="w-full gap-2" onClick={handleNext}>
            ادامه
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
        </BookingBottomBar>
      )}
    </div>
  );
}
